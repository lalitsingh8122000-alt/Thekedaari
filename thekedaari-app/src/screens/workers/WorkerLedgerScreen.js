import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, RefreshControl, Alert, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Card, StatCard, LedgerSkeleton, ErrorBox, BottomModal } from '../../components';

const fmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
const fmtDay = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN') : '';
const fmtAmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');

const categoryLabel = (cat) => {
  const map = { Salary: 'Salary', Overtime: 'Overtime', Bonus: 'Bonus', Payment: 'Payment', Contract: 'Contract (Theka)', Other: 'Other' };
  return map[cat] || cat;
};

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
  const [generating, setGenerating] = useState(false);

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

  const handlePrintPDF = async () => {
    if (!data || !data.worker || generating) return;
    setGenerating(true);
    try {
      const worker = data.worker;
      const ledger = data.ledger || [];
      const currentBalance = data.currentBalance || 0;

      const logoUri = Image.resolveAssetSource(require('../../../assets/logo.png'))?.uri || '';

      const now = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      
      const initial = (worker.name || 'W').charAt(0).toUpperCase();
      const totalCredit = ledger.filter((e) => e.type === 'Credit').reduce((s, e) => s + (e.amount || 0), 0);
      const totalDebit  = ledger.filter((e) => e.type === 'Debit').reduce((s, e) => s + (e.amount || 0), 0);

      const rowsHtml = ledger.map((e) => {
        const isCredit = e.type === 'Credit';
        const workDate = e.attendance?.date ? fmtDay(e.attendance.date) : (e.expense?.date ? fmtDay(e.expense.date) : '—');
        const note = [e.remarks, e.comment].filter(Boolean).join(' · ') || '—';
        return `
        <tr>
          <td>${fmtDay(e.createdAt)}</td>
          <td><span class="badge ${isCredit ? 'badge-credit' : 'badge-debit'}">${isCredit ? 'Earned' : 'Paid'}</span></td>
          <td>${categoryLabel(e.category)}</td>
          <td style="color:${isCredit ? '#15803d' : '#dc2626'};font-weight:700">${isCredit ? '+' : '−'}${fmtAmt(e.amount)}</td>
          <td>${workDate}</td>
          <td style="color:#64748b;font-size:9px;max-width:160px">${note}</td>
          <td style="font-weight:600">${fmtAmt(e.runningBalance)}</td>
        </tr>`;
      }).join('');

      const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Ledger — ${worker.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:13px}
.page{padding:14px;max-width:100%;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:12px;margin-bottom:12px;flex-wrap:wrap;gap:8px}
.brand{display:flex;align-items:center;gap:10px}
.brand-name{font-size:18px;font-weight:900;color:#2563eb;letter-spacing:-.5px}
.brand-tag{font-size:10px;color:#64748b;margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.rr{text-align:right}.rt{font-size:14px;font-weight:800;color:#1e293b}.rg{font-size:10px;color:#94a3b8;margin-top:3px}
.wcard{display:flex;align-items:center;gap:12px;background:#f8fafc;border-radius:12px;padding:10px 12px;margin-bottom:10px;border:1px solid #e2e8f0;flex-wrap:wrap}
.wphoto-ph{width:48px;height:48px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:900;color:#fff}
.wname{font-size:15px;font-weight:900;color:#1e293b}.wmeta{font-size:11px;color:#64748b;margin-top:2px}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.sc{border-radius:8px;padding:9px 6px;text-align:center}
.sc-earn{background:#dcfce7}.sc-paid{background:#fee2e2}.sc-bal{background:#dbeafe}
.sc-num{font-weight:900;font-size:12px;line-height:1}
.sc-earn .sc-num{color:#15803d}.sc-paid .sc-num{color:#dc2626}.sc-bal .sc-num{color:#2563eb}
.sc-label{font-size:9px;text-transform:uppercase;letter-spacing:.3px;color:#64748b;font-weight:700;margin-top:3px}
.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:8px;border:1px solid #e2e8f0}
table{width:100%;border-collapse:collapse;font-size:11px;min-width:520px}
thead{background:#1e293b;color:#fff}
thead th{padding:8px 7px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}
tbody tr:nth-child(even){background:#f8fafc}tbody tr:nth-child(odd){background:#fff}
tbody td{padding:7px 7px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.badge{display:inline-block;padding:3px 7px;border-radius:20px;font-size:10px;font-weight:700;white-space:nowrap}
.badge-credit{background:#dcfce7;color:#15803d}.badge-debit{background:#fee2e2;color:#dc2626}
.footer{margin-top:14px;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;color:#94a3b8;font-size:10px}
@media(min-width:640px){.page{padding:20px 24px;max-width:297mm}}
</style></head><body>
<div class="page">
  <div class="header">
    <div class="brand">
      ${logoUri ? `<img src="${logoUri}" alt="Thekedaari" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0">` : `<div style="width:44px;height:44px;border-radius:10px;background:#2563eb;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;font-weight:bold">T</div>`}
      <div><div class="brand-name">Thekedaari</div><div class="brand-tag">Construction Management</div></div>
    </div>
    <div class="rr"><div class="rt">Worker Ledger Report</div><div class="rg">Generated: ${now}</div></div>
  </div>
  <div class="wcard">
    <div class="wphoto-ph">${initial}</div>
    <div>
      <div class="wname">${worker.name}</div>
      <div class="wmeta">${worker.role?.name || '—'} · ₹${(worker.costPerDay || 0).toLocaleString('en-IN')}/day · ${worker.status || 'Active'}</div>
    </div>
  </div>
  <div class="summary">
    <div class="sc sc-earn"><div class="sc-num">₹${totalCredit.toLocaleString('en-IN')}</div><div class="sc-label">Total Earned</div></div>
    <div class="sc sc-paid"><div class="sc-num">₹${totalDebit.toLocaleString('en-IN')}</div><div class="sc-label">Total Paid</div></div>
    <div class="sc sc-bal"><div class="sc-num">₹${Math.abs(currentBalance).toLocaleString('en-IN')}${currentBalance < 0 ? ' (Advance)' : ''}</div><div class="sc-label">Balance</div></div>
  </div>
  <div class="table-wrap">
  <table>
    <thead><tr><th>Recorded On</th><th>Type</th><th>Category</th><th>Amount</th><th>Work Date</th><th>Note</th><th>Running Balance</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  </div>
  <div class="footer">
    <span>Thekedaari — Construction Management App</span>
    <span>${worker.name} · Ledger Report</span>
  </div>
</div>
</body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      const cleanName = (worker.name || 'Worker').replace(/[^a-zA-Z0-9]/g, '_');
      const pdfFileName = `Thekedaari_Ledger_Report_${cleanName}.pdf`;
      const newUri = FileSystem.cacheDirectory + pdfFileName;
      await FileSystem.copyAsync({ from: uri, to: newUri });
      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: `${worker.name} - Ledger Report`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
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
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.pageTitle}>{t('workerLedger')}</Text>
            <Text style={styles.subtitle}>{name || data?.worker?.name}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.downloadBtn, (!data || !data.ledger || data.ledger.length === 0 || generating) && { opacity: 0.5 }]}
          onPress={handlePrintPDF}
          disabled={!data || !data.ledger || data.ledger.length === 0 || generating}
        >
          <Text style={styles.downloadText}>
            {generating ? t('generating') : `📥 ${t('report')}`}
          </Text>
        </TouchableOpacity>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  backBtn: { padding: 6, backgroundColor: Colors.gray100, borderRadius: 10 },
  backIcon: { fontSize: 18, color: Colors.gray700 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  subtitle: { fontSize: 13, color: Colors.gray500, marginTop: 1 },
  downloadBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
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
