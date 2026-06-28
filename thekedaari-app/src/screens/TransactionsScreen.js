import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client';
import { Colors } from '../theme/colors';
import { Card, TransactionSkeleton, DatePickerField } from '../components';
import { useLanguage } from '../context/LanguageContext';

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN') : '';
const fmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');

export default function TransactionsScreen() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await client.get('/transactions', { params: { startDate, endDate } });
      setEntries(res.data.entries || []);
      setSummary({ totalIn: res.data.totalIn || 0, totalOut: res.data.totalOut || 0 });
    } catch { setEntries([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [startDate, endDate]));

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <Text style={styles.pageTitle}>{t('transactions')}</Text>

      <View style={styles.dateRow}>
        <DatePickerField
          value={startDate}
          onChange={setStartDate}
          label={t('from')}
          style={{ flex: 1 }}
        />
        <DatePickerField
          value={endDate}
          onChange={setEndDate}
          label={t('to')}
          style={{ flex: 1 }}
        />
      </View>

      {loading ? <TransactionSkeleton /> : (
        <FlatList
          data={entries}
          keyExtractor={(e, i) => `${e.type}-${e.id || i}`}
          contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 8 }}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
          ListHeaderComponent={
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { borderLeftColor: Colors.green }]}>
                <Text style={styles.summaryLabel}>{t('moneyIn')}</Text>
                <Text style={[styles.summaryValue, { color: Colors.green }]}>+{fmt(summary.totalIn)}</Text>
              </View>
              <View style={[styles.summaryCard, { borderLeftColor: Colors.red }]}>
                <Text style={styles.summaryLabel}>{t('moneyOut')}</Text>
                <Text style={[styles.summaryValue, { color: Colors.red }]}>−{fmt(summary.totalOut)}</Text>
              </View>
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
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  dateRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14,
    borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  summaryLabel: { fontSize: 12, color: Colors.gray500 },
  summaryValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  dirIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  txAmt: { fontSize: 15, fontWeight: '700' },
});
