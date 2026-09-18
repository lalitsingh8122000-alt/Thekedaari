import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client';
import { Colors } from '../theme/colors';
import { Card, TransactionSkeleton, DatePickerField } from '../components';
import { useLanguage } from '../context/LanguageContext';

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN') : '';
const fmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
const todayStr = () => new Date().toISOString().split('T')[0];

function currentMonthRange() {
  const d = new Date();
  const y = d.getFullYear(), m = d.getMonth() + 1;
  const last = new Date(y, m, 0).getDate();
  const pad = (n) => String(n).padStart(2, '0');
  return { start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-${pad(last)}` };
}

const PRESETS = [
  { key: 'today', labelKey: 'today', defaultLabel: 'Today', getRange: () => ({ start: todayStr(), end: todayStr() }) },
  { key: 'week', labelKey: 'thisWeek', defaultLabel: 'This Week', getRange: () => {
    const d = new Date(); const dow = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
    return { start: mon.toISOString().split('T')[0], end: todayStr() };
  }},
  { key: 'month', labelKey: 'thisMonth', defaultLabel: 'This Month', getRange: currentMonthRange },
  { key: 'custom', labelKey: 'custom', defaultLabel: 'Custom', getRange: null },
];

const FILTERS = [
  { key: 'all', labelKey: 'all', defaultLabel: 'All' },
  { key: 'out', labelKey: 'paidOut', defaultLabel: 'Paid Out' },
  { key: 'in', labelKey: 'received', defaultLabel: 'Received' },
  { key: 'worker_payment', labelKey: 'workers', defaultLabel: 'Workers' },
  { key: 'expense', labelKey: 'expenses_short', defaultLabel: 'Expenses' },
  { key: 'income', labelKey: 'income', defaultLabel: 'Income' },
  { key: 'vendor', labelKey: 'vendors', defaultLabel: 'Vendors' },
  { key: 'manual_ledger', labelKey: 'ledger', defaultLabel: 'Ledger' },
];

export default function TransactionsScreen() {
  const { t } = useLanguage();
  const [presetIndex, setPresetIndex] = useState(2); // default This Month
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const range = useMemo(() => {
    if (presetIndex === 3) return { start: customStart, end: customEnd };
    return PRESETS[presetIndex].getRange();
  }, [presetIndex, customStart, customEnd]);

  const load = async (isRefresh = false) => {
    if (!range.start || !range.end) return;
    if (isRefresh) setRefreshing(true);
    try {
      const res = await client.get('/transactions', { params: { startDate: range.start, endDate: range.end } });
      setEntries(res.data.entries || []);
      setSummary({ totalIn: res.data.totalIn || 0, totalOut: res.data.totalOut || 0 });
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, [range.start, range.end]));

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    if (filterType === 'all') return entries;
    if (filterType === 'out') return entries.filter((e) => e.direction === 'out');
    if (filterType === 'in')  return entries.filter((e) => e.direction === 'in');
    return entries.filter((e) => e.type === filterType);
  }, [entries, filterType]);

  const netBalance = (summary.totalIn || 0) - (summary.totalOut || 0);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <Text style={styles.pageTitle}>{t('transactions')}</Text>

      {/* Date Preset Segmented Control */}
      <View style={styles.presetRow}>
        {PRESETS.map((p, i) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.presetBtn, presetIndex === i && styles.presetBtnActive]}
            onPress={() => setPresetIndex(i)}
          >
            <Text style={[styles.presetText, presetIndex === i && styles.presetTextActive]}>
              {t(p.labelKey) || p.defaultLabel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Date Pickers */}
      {presetIndex === 3 && (
        <View style={styles.dateRow}>
          <DatePickerField
            value={customStart}
            onChange={setCustomStart}
            label={t('from')}
            style={{ flex: 1 }}
          />
          <DatePickerField
            value={customEnd}
            onChange={setCustomEnd}
            label={t('to')}
            style={{ flex: 1 }}
          />
        </View>
      )}

      {/* Filter Chips */}
      <View style={{ paddingHorizontal: 14, marginVertical: 6 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filterType === f.key && styles.chipActive]}
              onPress={() => setFilterType(f.key)}
            >
              <Text style={[styles.chipText, filterType === f.key && styles.chipTextActive]}>
                {t(f.labelKey) || f.defaultLabel}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? <TransactionSkeleton /> : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(e, i) => `${e.type}-${e.id || i}`}
          contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 8 }}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
          ListHeaderComponent={
            <View style={{ gap: 8, marginBottom: 10 }}>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { borderLeftColor: Colors.green }]}>
                  <Text style={styles.summaryLabel}>{t('moneyIn') || 'Money In'}</Text>
                  <Text style={[styles.summaryValue, { color: Colors.green }]}>+{fmt(summary.totalIn)}</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: Colors.red }]}>
                  <Text style={styles.summaryLabel}>{t('moneyOut') || 'Money Out'}</Text>
                  <Text style={[styles.summaryValue, { color: Colors.red }]}>−{fmt(summary.totalOut)}</Text>
                </View>
              </View>

              {(summary.totalOut > 0 || summary.totalIn > 0) && (
                <View style={[styles.netCard, { backgroundColor: netBalance >= 0 ? Colors.primaryLight : '#ffedd5', borderColor: netBalance >= 0 ? '#bfdbfe' : '#fed7aa' }]}>
                  <Text style={[styles.netLabel, { color: netBalance >= 0 ? Colors.primaryDark : '#c2410c' }]}>
                    📊 {t('netBalance') || 'Net Balance'}
                  </Text>
                  <Text style={[styles.netValue, { color: netBalance >= 0 ? Colors.primaryDark : '#c2410c' }]}>
                    {netBalance >= 0 ? '+' : '−'}{fmt(Math.abs(netBalance))}
                  </Text>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Text style={{ color: Colors.gray400 }}>{t('noTransactions')}</Text>
            </Card>
          }
          renderItem={({ item: e }) => {
            const isIn = e.direction === 'in';
            return (
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.dirIcon, { backgroundColor: isIn ? Colors.greenLight : Colors.redLight }]}>
                  <Text style={{ fontSize: 16 }}>{isIn ? '↑' : '↓'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.gray800 }} numberOfLines={1}>
                    {e.label}
                  </Text>
                  {e.sublabel ? <Text style={{ fontSize: 12, color: Colors.gray500 }} numberOfLines={1}>{e.sublabel}</Text> : null}
                  {e.note ? <Text style={{ fontSize: 11, color: Colors.gray400 }} numberOfLines={1}>{e.note}</Text> : null}
                  <Text style={{ fontSize: 11, color: Colors.gray400, marginTop: 2 }}>{fmtDate(e.date)}</Text>
                </View>
                <Text style={[styles.txAmt, { color: isIn ? Colors.green : Colors.red }]}>
                  {isIn ? '+' : '−'}{fmt(e.amount)}
                </Text>
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },

  presetRow: {
    flexDirection: 'row', backgroundColor: Colors.gray100, borderRadius: 12,
    padding: 3, marginHorizontal: 14, marginBottom: 4,
  },
  presetBtn: { flex: 1, paddingVertical: 7, borderRadius: 9, alignItems: 'center' },
  presetBtnActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  presetText: { fontSize: 12, fontWeight: '600', color: Colors.gray500 },
  presetTextActive: { color: Colors.primaryDark, fontWeight: '800' },

  dateRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginVertical: 6 },
  
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.gray100 },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.gray600 },
  chipTextActive: { color: Colors.white, fontWeight: '700' },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14,
    borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  summaryLabel: { fontSize: 12, color: Colors.gray500 },
  summaryValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },

  netCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14,
  },
  netLabel: { fontSize: 13, fontWeight: '800' },
  netValue: { fontSize: 16, fontWeight: '900' },

  dirIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  txAmt: { fontSize: 15, fontWeight: '700' },
});
