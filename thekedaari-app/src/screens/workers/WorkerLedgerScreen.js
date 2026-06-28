import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Card, StatCard, LedgerSkeleton, ErrorBox, BottomModal } from '../../components';

const fmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
const fmtDay = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN') : '';

export default function WorkerLedgerScreen({ route, navigation }) {
  const { t } = useLanguage();
  const { workerId, name } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(null); // 'add' | 'pay'
  const [form, setForm] = useState({ amount: '', category: 'Payment', comment: '', remarks: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await client.get(`/ledger/${workerId}`);
      setData(res.data);
    } catch { navigation.goBack(); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [workerId]));

  const openAdd = () => { setError(''); setForm({ amount: '', category: 'Bonus', comment: '', remarks: '' }); setModal('add'); };
  const openPay = () => { setError(''); setForm({ amount: '', category: 'Payment', comment: '', remarks: '' }); setModal('pay'); };

  const save = async () => {
    if (saving) return;
    setError('');
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { setError(t('enterAmount')); return; }
    setSaving(true);
    try {
      await client.post('/ledger', {
        workerId: parseInt(workerId, 10),
        amount,
        type: modal === 'add' ? 'Credit' : 'Debit',
        category: form.category,
        remarks: form.remarks.trim(),
        comment: form.comment.trim(),
      });
      setModal(null);
      setLoading(true);
      load();
    } catch (err) {
      setError(err.response?.data?.error || t('saveErrorShort'));
    } finally { setSaving(false); }
  };

  const catLabel = (c) => ({
    Salary: t('salary'), Bonus: t('bonus'), Payment: t('payment'),
    Contract: t('contract'), Other: t('other'),
  }[c] || c);

  const balance = data?.currentBalance || 0;
  const balanceColor = balance > 0 ? Colors.red : balance < 0 ? Colors.emerald : Colors.gray500;
  const balanceBorder = balance > 0 ? Colors.red : balance < 0 ? Colors.emerald : Colors.gray300;
  const balanceHint = balance > 0 ? t('owedToWorker') : balance < 0 ? t('advanceGiven') : t('balanced');

  if (loading) return <LedgerSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.pageTitle}>{t('workerLedger')}</Text>
          <Text style={styles.subtitle}>{name || data?.worker?.name}</Text>
        </View>
      </View>

      <FlatList
        data={data?.ledger || []}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={{ padding: 14, paddingBottom: 40, gap: 8 }}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />
        }
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 10 }}>
            <StatCard borderColor={balanceBorder}>
              <Text style={styles.balLabel}>{t('currentBalance')}</Text>
              <Text style={[styles.balValue, { color: balanceColor }]}>{fmt(balance)}</Text>
              <Text style={[styles.balHint, { color: balanceColor }]}>{balanceHint}</Text>
            </StatCard>
            <View style={styles.row2}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.emeraldBg, borderColor: '#a7f3d0' }]} onPress={openAdd}>
                <Text style={{ fontSize: 16 }}>📈</Text>
                <Text style={[styles.actionLabel, { color: '#065f46' }]}>{t('addEarnings')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.redBg, borderColor: '#fecaca' }]} onPress={openPay}>
                <Text style={{ fontSize: 16 }}>💸</Text>
                <Text style={[styles.actionLabel, { color: Colors.red }]}>{t('recordPayment')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
            <Text style={{ color: Colors.gray400 }}>{t('noEntries')}</Text>
          </Card>
        }
        renderItem={({ item: entry }) => {
          const isOwed = entry.type === 'Credit';
          return (
            <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <View style={styles.entryTags}>
                  <View style={[styles.tag, { backgroundColor: isOwed ? Colors.emeraldLight : Colors.redLight }]}>
                    <Text style={[styles.tagText, { color: isOwed ? '#065f46' : Colors.red }]}>
                      {isOwed ? t('added') : t('paid')}
                    </Text>
                  </View>
                  <Text style={styles.catText}>{catLabel(entry.category)}</Text>
                </View>
                {(entry.remarks || entry.comment) && (
                  <Text style={styles.entryNote} numberOfLines={2}>
                    {[entry.remarks, entry.comment].filter(Boolean).join(' · ')}
                  </Text>
                )}
                <View style={{ marginTop: 4 }}>
                  {entry.attendance?.date && (
                    <Text style={styles.dateText}>{t('workDate')}: {fmtDay(entry.attendance.date)}</Text>
                  )}
                  <Text style={styles.dateText}>{t('entryDate')}: {fmtDay(entry.createdAt)}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.entryAmt, { color: isOwed ? Colors.emerald : Colors.red }]}>
                  {isOwed ? '+' : '−'}{fmt(entry.amount)}
                </Text>
                <Text style={styles.runningBal}>{t('runningTotal')}: {fmt(entry.runningBalance)}</Text>
              </View>
            </Card>
          );
        }}
      />

      {/* Add Balance Modal */}
      <BottomModal
        visible={modal === 'add'}
        onClose={() => setModal(null)}
        title={t('addToAccount')}
      >
        <ErrorBox message={error} />
        <Text style={styles.fieldLabel}>{t('amount')}</Text>
        <TextInput
          style={[styles.input, { textAlign: 'center', fontSize: 20, fontWeight: '700' }]}
          value={form.amount}
          onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
          keyboardType="numeric"
          placeholder="₹"
          placeholderTextColor={Colors.gray400}
        />
        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>{t('category')}</Text>
        <View style={styles.row3}>
          {['Salary', 'Bonus', 'Other'].map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catBtn, form.category === c && styles.catBtnActive]}
              onPress={() => setForm((f) => ({ ...f, category: c }))}
            >
              <Text style={[styles.catBtnText, form.category === c && { color: Colors.white }]}>
                {catLabel(c)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>{t('comment')}</Text>
        <TextInput
          style={styles.input}
          value={form.comment}
          onChangeText={(v) => setForm((f) => ({ ...f, comment: v }))}
          placeholder={t('optionalNote')}
          placeholderTextColor={Colors.gray400}
        />
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.emerald, marginTop: 16 }, saving && { opacity: 0.6 }]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? t('saveDot') : t('add')}</Text>
        </TouchableOpacity>
      </BottomModal>

      {/* Pay Worker Modal */}
      <BottomModal
        visible={modal === 'pay'}
        onClose={() => setModal(null)}
        title={t('payWorker')}
      >
        <ErrorBox message={error} />
        <Text style={styles.fieldLabel}>{t('amount')}</Text>
        <TextInput
          style={[styles.input, { textAlign: 'center', fontSize: 20, fontWeight: '700' }]}
          value={form.amount}
          onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
          keyboardType="numeric"
          placeholder="₹"
          placeholderTextColor={Colors.gray400}
        />
        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>{t('category')}</Text>
        <View style={styles.row3}>
          {['Payment', 'Other'].map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catBtn, form.category === c && styles.catBtnActive]}
              onPress={() => setForm((f) => ({ ...f, category: c }))}
            >
              <Text style={[styles.catBtnText, form.category === c && { color: Colors.white }]}>
                {catLabel(c)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>{t('comment')}</Text>
        <TextInput
          style={styles.input}
          value={form.comment}
          onChangeText={(v) => setForm((f) => ({ ...f, comment: v }))}
          placeholder={t('optionalNote')}
          placeholderTextColor={Colors.gray400}
        />
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.red, marginTop: 16 }, saving && { opacity: 0.6 }]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? t('saveDot') : t('recordPayment')}</Text>
        </TouchableOpacity>
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn: { padding: 6, backgroundColor: Colors.gray100, borderRadius: 10 },
  backIcon: { fontSize: 18, color: Colors.gray700 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  subtitle: { fontSize: 13, color: Colors.gray500, marginTop: 1 },
  balLabel: { fontSize: 13, color: Colors.gray500 },
  balValue: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  balHint: { fontSize: 12, marginTop: 4 },
  row2: { flexDirection: 'row', gap: 10 },
  row3: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, gap: 4,
  },
  actionLabel: { fontSize: 13, fontWeight: '600' },
  entryTags: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  catText: { fontSize: 13, fontWeight: '600', color: Colors.gray700 },
  entryNote: { fontSize: 12, color: Colors.gray500, marginTop: 4 },
  dateText: { fontSize: 11, color: Colors.gray400 },
  entryAmt: { fontSize: 15, fontWeight: '700' },
  runningBal: { fontSize: 11, color: Colors.gray400, marginTop: 2 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray600, marginBottom: 6 },
  input: {
    borderWidth: 2, borderColor: Colors.gray200, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: Colors.gray800,
    backgroundColor: Colors.white,
  },
  catBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  catBtnActive: { backgroundColor: Colors.primary },
  catBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
