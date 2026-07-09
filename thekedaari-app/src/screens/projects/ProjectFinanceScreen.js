import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, RefreshControl, ScrollView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { LOGO_BASE64 } from '../../assets/logoBase64';
import {
  Card, StatCard, FinanceSkeleton, ErrorBox, BottomModal, ConfirmModal, DatePickerField,
} from '../../components';

const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN') : '';
const toDateInput = (v) => v ? (typeof v === 'string' ? v : new Date(v).toISOString()).slice(0, 10) : new Date().toISOString().split('T')[0];

const EXPENSE_CATS = ['Cement', 'Sand', 'Brick', 'Steel', 'Aggregate', 'Others'];

export default function ProjectFinanceScreen({ route, navigation }) {
  const { t } = useLanguage();
  const { id, name } = route.params;

  const expLabel = (r) => ({
    Cement: t('cement'), Sand: t('sand'), Brick: t('brick'), Steel: t('steel'),
    Aggregate: t('aggregate'), Others: t('other'), Other: t('other'),
    Contract: t('contract'), Labour: t('labourCost'),
  }[r] || r);

  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [contractTrades, setContractTrades] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modal, setModal] = useState(null);
  const [editIncomeId, setEditIncomeId] = useState(null);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const [incForm, setIncForm] = useState({ amount: '', date: '', paymentMode: 'Cash', remarks: '' });
  const [expForm, setExpForm] = useState({ amount: '', date: '', remarks: '', notes: '', vendorId: '' });
  const [conForm, setConForm] = useState({ amount: '', date: '', contractTradeId: '', contractorId: '', notes: '' });

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [s, i, e, w, tr, vn] = await Promise.all([
        client.get(`/finance/projects/${id}/summary`),
        client.get(`/finance/projects/${id}/income`),
        client.get(`/finance/projects/${id}/expenses`),
        client.get('/workers', { params: { status: 'Active' } }),
        client.get('/contract-trades'),
        client.get('/vendors', { params: { status: 'Active' } }),
      ]);
      setSummary(s.data);
      setIncomes(i.data);
      setExpenses(e.data);
      setWorkers(Array.isArray(w.data) ? w.data : []);
      setContractTrades(Array.isArray(tr.data) ? tr.data : []);
      setVendors(Array.isArray(vn.data) ? vn.data : []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const contractors = workers.filter((w) =>
    w.workerType === 'Contractor' || (w.role?.name || '').toLowerCase().includes('contract') ||
    (w.role?.name || '').toLowerCase().includes('ठेक')
  );

  const contractorsForTrade = useMemo(() => {
    const tid = conForm.contractTradeId;
    if (!tid) return [];
    return contractors.filter((c) =>
      String(c.contractTradeId ?? '') === String(tid) || c.contractTradeId == null || c.contractTradeId === ''
    );
  }, [contractors, conForm.contractTradeId]);

  const resetForms = () => {
    const today = new Date().toISOString().split('T')[0];
    setIncForm({ amount: '', date: today, paymentMode: 'Cash', remarks: '' });
    setExpForm({ amount: '', date: today, remarks: '', notes: '', vendorId: '' });
    setConForm({ amount: '', date: today, contractTradeId: '', contractorId: '', notes: '' });
    setError('');
    setEditIncomeId(null);
    setEditExpenseId(null);
  };

  const openIncome = (item = null) => {
    resetForms();
    if (item) {
      setEditIncomeId(item.id);
      setIncForm({ amount: String(item.amount), date: toDateInput(item.date), paymentMode: item.paymentMode, remarks: item.remarks || '' });
    }
    setModal('income');
  };

  const openExpense = (item = null) => {
    resetForms();
    if (item) {
      setEditExpenseId(item.id);
      if (item.remarks === 'Contract') {
        setConForm({ amount: String(item.amount), date: toDateInput(item.date), contractTradeId: item.contractTradeId != null ? String(item.contractTradeId) : '', contractorId: item.workerId != null ? String(item.workerId) : '', notes: item.notes || '' });
        setModal('contract');
        return;
      }
      setExpForm({ amount: String(item.amount), date: toDateInput(item.date), remarks: item.remarks || '', notes: item.notes || '', vendorId: item.vendorId != null ? String(item.vendorId) : '' });
    }
    setModal('expense');
  };

  const saveIncome = async () => {
    if (saving) return;
    setError('');
    const amount = parseFloat(incForm.amount);
    if (!amount || amount <= 0) { setError(t('enterAmount')); return; }
    setSaving(true);
    try {
      const body = { amount, date: incForm.date, paymentMode: incForm.paymentMode, remarks: incForm.remarks.trim() };
      if (editIncomeId != null) await client.patch(`/finance/income/${editIncomeId}`, body);
      else await client.post(`/finance/projects/${id}/income`, body);
      setModal(null);
      setLoading(true); load();
    } catch (err) { setError(err.response?.data?.error || t('saveErrorShort')); }
    finally { setSaving(false); }
  };

  const saveExpense = async () => {
    if (saving) return;
    setError('');
    const amount = parseFloat(expForm.amount);
    if (!amount || amount <= 0) { setError(t('enterAmount')); return; }
    if (!expForm.remarks) { setError(t('selectCategory')); return; }
    setSaving(true);
    try {
      const body = {
        amount,
        date: expForm.date,
        remarks: expForm.remarks,
        notes: expForm.notes.trim(),
        vendorId: expForm.vendorId ? parseInt(expForm.vendorId, 10) : null,
      };
      if (editExpenseId != null) await client.patch(`/finance/expenses/${editExpenseId}`, body);
      else await client.post(`/finance/projects/${id}/expenses`, body);
      setModal(null);
      setLoading(true); load();
    } catch (err) { setError(err.response?.data?.error || t('saveErrorShort')); }
    finally { setSaving(false); }
  };

  const saveContract = async () => {
    if (saving) return;
    setError('');
    const amount = parseFloat(conForm.amount);
    if (!amount || amount <= 0) { setError(t('enterAmount')); return; }
    if (!conForm.contractTradeId) { setError(t('selectContractType')); return; }
    if (!conForm.contractorId) { setError(t('selectContractorError')); return; }
    setSaving(true);
    try {
      const body = { amount, date: conForm.date, remarks: 'Contract', notes: conForm.notes.trim(), workerId: parseInt(conForm.contractorId, 10), contractTradeId: parseInt(conForm.contractTradeId, 10) };
      if (editExpenseId != null) await client.patch(`/finance/expenses/${editExpenseId}`, body);
      else await client.post(`/finance/projects/${id}/expenses`, body);
      setModal(null);
      setLoading(true); load();
    } catch (err) { setError(err.response?.data?.error || t('saveErrorShort')); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      if (pendingDelete.kind === 'income') await client.delete(`/finance/income/${pendingDelete.id}`);
      else await client.delete(`/finance/expenses/${pendingDelete.id}`);
      setPendingDelete(null);
      setLoading(true); load();
    } catch { setPendingDelete(null); }
    finally { setDeleting(false); }
  };

  const handleDownloadReport = async () => {
    if (!summary) return;
    try {
      const now = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      const fmtDateLocal = (d) => {
        if (!d) return '—';
        const dateVal = new Date(d);
        if (isNaN(dateVal.getTime())) return '—';
        return dateVal.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      };
      const fmtRsLocal = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
      const profitColor = summary.profitLoss >= 0 ? '#16a34a' : '#dc2626';
      const profitLabel = summary.profitLoss >= 0 ? t('profit') : t('loss');
      const hasContract = summary.totalContractExpense > 0;

      const incomeRowsHtml = incomes.map((i) => `
        <tr>
          <td>${fmtDateLocal(i.date)}</td>
          <td style="color:#16a34a;font-weight:700">${fmtRsLocal(i.amount)}</td>
          <td>${i.paymentMode === 'Cash' ? t('cash') : t('online')}</td>
          <td style="color:#64748b;font-size:9px">${i.remarks || '—'}</td>
        </tr>`).join('');

      const expenseRowsHtml = expenses.map((e) => `
        <tr>
          <td>${fmtDateLocal(e.date)}</td>
          <td>${expLabel(e.remarks)}</td>
          <td style="color:#dc2626;font-weight:700">${fmtRsLocal(e.amount)}</td>
          <td style="color:#64748b">${e.vendor?.name || e.worker?.name || '—'}</td>
          <td style="color:#64748b;font-size:9px">${e.notes || '—'}</td>
        </tr>`).join('');

      const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Expense Report — ${summary.project?.name || name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:11px}
.page{padding:20px 24px;max-width:297mm;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:12px;margin-bottom:12px}
.brand{display:flex;align-items:center;gap:10px}
.brand-name{font-size:18px;font-weight:900;color:#2563eb;letter-spacing:-.5px}
.brand-tag{font-size:10px;color:#64748b;margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.rr{text-align:right}.rt{font-size:14px;font-weight:800;color:#1e293b}.rg{font-size:10px;color:#94a3b8;margin-top:3px}
.proj-row{background:#f1f5f9;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:13px}
.proj-name{font-weight:900;font-size:15px;color:#1e293b}.proj-meta{font-size:10px;color:#64748b;margin-top:2px}
.summary{display:grid;grid-template-columns:repeat(${hasContract ? 6 : 5},1fr);gap:6px;margin-bottom:12px}
.sc{border-radius:8px;padding:8px 4px;text-align:center}
.sc-income{background:#dcfce7}.sc-material{background:#fee2e2}.sc-labour{background:#ffedd5}
.sc-contract{background:#fef9c3}.sc-total{background:#fecaca}.sc-pl{background:#dbeafe}
.sc-loss{background:#fecaca}
.sc-num{font-weight:900;font-size:12px;line-height:1}
.sc-income .sc-num{color:#16a34a}.sc-material .sc-num{color:#dc2626}.sc-labour .sc-num{color:#ea580c}
.sc-contract .sc-num{color:#a16207}.sc-total .sc-num{color:#b91c1c}
.sc-pl .sc-num{color:#2563eb}.sc-loss .sc-num{color:#dc2626}
.sc-label{font-size:8px;text-transform:uppercase;letter-spacing:.3px;color:#64748b;font-weight:700;margin-top:3px}
.section-title{font-size:11px;font-weight:800;color:#1e293b;margin:12px 0 5px;padding-left:8px;border-left:3px solid #2563eb;text-transform:uppercase;letter-spacing:.4px}
.section-title.green{border-color:#16a34a}.section-title.red{border-color:#ef4444}
.table-wrap{border-radius:8px;border:1px solid #e2e8f0;margin-bottom:10px;overflow:hidden}
table{width:100%;border-collapse:collapse;font-size:10px}
thead{background:#1e293b;color:#fff}
thead th{padding:8px 7px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}
tbody tr:nth-child(even){background:#f8fafc}tbody tr:nth-child(odd){background:#fff}
tbody td{padding:7px 7px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.footer{margin-top:14px;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;color:#94a3b8;font-size:9px}
</style></head><body>
<div class="page">
  <div class="header">
    <div class="brand">
      <img src="${LOGO_BASE64}" alt="Thekedaari" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0">
      <div><div class="brand-name">Thekedaari</div><div class="brand-tag">Construction Management</div></div>
    </div>
    <div class="rr"><div class="rt">Expense Report</div><div class="rg">Generated: ${now}</div></div>
  </div>
  <div class="proj-row">
    <div class="proj-name">${summary.project?.name || name}</div>
    <div class="proj-meta">${t('totalIncome')}: ${fmtRsLocal(summary.totalIncome)} &nbsp;&middot;&nbsp; ${t('totalExpense')}: ${fmtRsLocal(summary.totalExpense)} &nbsp;&middot;&nbsp; ${profitLabel}: ${fmtRsLocal(Math.abs(summary.profitLoss))}</div>
  </div>
  <div class="summary">
    <div class="sc sc-income"><div class="sc-num">${fmtRsLocal(summary.totalIncome)}</div><div class="sc-label">${t('totalIncome')}</div></div>
    <div class="sc sc-material"><div class="sc-num">${fmtRsLocal(summary.totalMaterialExpense)}</div><div class="sc-label">${t('materialExpense')}</div></div>
    <div class="sc sc-labour"><div class="sc-num">${fmtRsLocal(summary.totalLabourCost)}</div><div class="sc-label">${t('labourCost')}</div></div>
    ${hasContract ? `<div class="sc sc-contract"><div class="sc-num">${fmtRsLocal(summary.totalContractExpense)}</div><div class="sc-label">${t('contractExpense')}</div></div>` : ''}
    <div class="sc sc-total"><div class="sc-num">${fmtRsLocal(summary.totalExpense)}</div><div class="sc-label">${t('totalExpense')}</div></div>
    <div class="sc ${summary.profitLoss >= 0 ? 'sc-pl' : 'sc-loss'}"><div class="sc-num" style="color:${profitColor}">${fmtRsLocal(Math.abs(summary.profitLoss))}</div><div class="sc-label">${profitLabel}</div></div>
  </div>
  ${incomes.length > 0 ? `
  <div class="section-title green">${t('income')} (${incomes.length})</div>
  <div class="table-wrap"><table>
    <thead><tr><th>${t('date')}</th><th>${t('amount')}</th><th>${t('paymentMethod')}</th><th>${t('remarks')}</th></tr></thead>
    <tbody>${incomeRowsHtml}</tbody>
  </table></div>` : ''}
  ${expenses.length > 0 ? `
  <div class="section-title red">${t('expense')} (${expenses.length})</div>
  <div class="table-wrap"><table>
    <thead><tr><th>${t('date')}</th><th>${t('remarks')}</th><th>${t('amount')}</th><th>${t('vendor') || 'Vendor'} / ${t('contractor') || 'Contractor'}</th><th>${t('note')}</th></tr></thead>
    <tbody>${expenseRowsHtml}</tbody>
  </table></div>` : ''}
  <div class="footer">
    <span>Thekedaari — Construction Management App</span>
    <span>${summary.project?.name || name} · Expense Report</span>
  </div>
</div>
</body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      const cleanProj = (summary.project?.name || name || 'Project').replace(/[^a-zA-Z0-9]/g, '_');
      const cleanDate = new Date().toISOString().split('T')[0];
      const pdfFileName = `Thekedaari_Expense_Report_${cleanProj}_${cleanDate}.pdf`;
      const newUri = FileSystem.cacheDirectory + pdfFileName;
      await FileSystem.copyAsync({ from: uri, to: newUri });
      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: `${summary.project?.name || name} - Expense Report`,
        UTI: 'com.adobe.pdf',
      });
    } catch (err) {
      console.log('PDF generation error:', err);
      Alert.alert('Error', `Failed to generate Expense Report PDF: ${err.message || err}`);
    }
  };

  if (loading) return <FinanceSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{t('projectFinance')}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{summary?.project?.name || name}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['summary', 'income', 'expense'].map((tp) => (
          <TouchableOpacity
            key={tp}
            style={[styles.tab, tab === tp && styles.tabActive]}
            onPress={() => setTab(tp)}
          >
            <Text style={[styles.tabText, tab === tp && { color: Colors.white }]}>
              {tp === 'summary' ? t('summary') : tp === 'income' ? t('income') : t('expense')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 10 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
      >
        {/* Summary Tab */}
        {tab === 'summary' && summary && (
          <>
            <StatCard borderColor={Colors.green}>
              <Text style={styles.statLabel}>{t('totalIncome')}</Text>
              <Text style={[styles.statValue, { color: Colors.green }]}>{fmt(summary.totalIncome)}</Text>
            </StatCard>
            <View style={styles.grid2}>
              <StatCard borderColor={Colors.red} style={{ flex: 1 }}>
                <Text style={styles.statLabel}>{t('materialExpense')}</Text>
                <Text style={[styles.statValue, { color: Colors.red }]}>{fmt(summary.totalMaterialExpense)}</Text>
              </StatCard>
              <StatCard borderColor={Colors.orange} style={{ flex: 1 }}>
                <Text style={styles.statLabel}>{t('labourCost')}</Text>
                <Text style={[styles.statValue, { color: Colors.orange }]}>{fmt(summary.totalLabourCost)}</Text>
              </StatCard>
            </View>
            {summary.totalContractExpense > 0 && (
              <StatCard borderColor={Colors.amber}>
                <Text style={styles.statLabel}>{t('contractExpense')}</Text>
                <Text style={[styles.statValue, { color: Colors.amber }]}>{fmt(summary.totalContractExpense)}</Text>
              </StatCard>
            )}
            <StatCard borderColor={Colors.red}>
              <Text style={styles.statLabel}>{t('totalExpense')}</Text>
              <Text style={[styles.statValue, { color: Colors.red }]}>{fmt(summary.totalExpense)}</Text>
            </StatCard>
            <StatCard borderColor={summary.profitLoss >= 0 ? Colors.green : Colors.red}>
              <Text style={{ fontSize: 24 }}>{summary.profitLoss >= 0 ? '📈' : '📉'}</Text>
              <Text style={styles.statLabel}>{t('profitLoss')}</Text>
              <Text style={[styles.bigValue, { color: summary.profitLoss >= 0 ? Colors.green : Colors.red }]}>
                {fmt(Math.abs(summary.profitLoss))}
                <Text style={{ fontSize: 14 }}> {summary.profitLoss >= 0 ? t('profit') : t('loss')}</Text>
              </Text>
            </StatCard>
          </>
        )}

        {/* Income Tab */}
        {tab === 'income' && (
          <>
            <TouchableOpacity style={[styles.addRowBtn, { backgroundColor: Colors.green }]} onPress={() => openIncome()}>
              <Text style={styles.addRowBtnText}>{t('addIncome')}</Text>
            </TouchableOpacity>
            {incomes.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Text style={{ color: Colors.gray400 }}>{t('noIncome')}</Text>
              </Card>
            ) : incomes.map((i) => (
              <Card key={i.id} style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 16, color: Colors.green }}>{fmt(i.amount)}</Text>
                  <Text style={{ fontSize: 12, color: Colors.gray400, marginTop: 2 }}>
                    {fmtDate(i.date)} · {i.paymentMode === 'Cash' ? t('cash') : t('online')}
                  </Text>
                  {i.remarks ? <Text style={{ fontSize: 12, color: Colors.gray500, marginTop: 2 }}>{i.remarks}</Text> : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openIncome(i)}>
                    <Text>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, { backgroundColor: Colors.redBg }]} onPress={() => setPendingDelete({ kind: 'income', id: i.id })}>
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Expense Tab */}
        {tab === 'expense' && (
          <>
            <View style={styles.grid2}>
              <TouchableOpacity style={[styles.addRowBtn, { backgroundColor: Colors.red, flex: 1 }]} onPress={() => openExpense()}>
                <Text style={styles.addRowBtnText}>{t('addMaterial')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addRowBtn, { backgroundColor: '#d97706', flex: 1 }]} onPress={() => { resetForms(); setModal('contract'); }}>
                <Text style={styles.addRowBtnText}>{t('addContractBtn')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.addRowBtn, { backgroundColor: Colors.primary, marginTop: 4 }]} onPress={handleDownloadReport}>
              <Text style={styles.addRowBtnText}>⬇️ {t('downloadReport') || 'Download Expense Report'}</Text>
            </TouchableOpacity>
            {expenses.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Text style={{ color: Colors.gray400 }}>{t('noExpense')}</Text>
              </Card>
            ) : expenses.map((e) => (
              <Card key={e.id}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 16, color: Colors.red }}>{fmt(e.amount)}</Text>
                    <Text style={{ fontSize: 12, color: Colors.gray400, marginTop: 2 }}>{fmtDate(e.date)}</Text>
                    <View style={styles.expBadge}>
                      <Text style={{ fontSize: 11, color: Colors.red, fontWeight: '700' }}>{expLabel(e.remarks)}</Text>
                    </View>
                  </View>
                  {e.remarks !== 'Labour' && (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => openExpense(e)}>
                        <Text>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.iconBtn, { backgroundColor: Colors.redBg }]} onPress={() => setPendingDelete({ kind: 'expense', id: e.id })}>
                        <Text>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {e.worker && (
                  <Text style={{ fontSize: 12, color: '#92400e', marginTop: 4, fontWeight: '600' }}>
                    {e.remarks === 'Contract' ? t('contractor') : t('paid')}: {e.worker.name}
                    {e.contractTrade?.name ? ` · ${e.contractTrade.name}` : ''}
                  </Text>
                )}
                {e.vendor && (
                  <Text style={{ fontSize: 12, color: '#6d28d9', marginTop: 4, fontWeight: '600' }}>
                    🚚 {t('vendor_from') || 'From'}: {e.vendor.name}
                  </Text>
                )}
                {e.notes ? <Text style={{ fontSize: 12, color: Colors.gray500, marginTop: 2 }}>{e.notes}</Text> : null}
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {/* Income Modal */}
      <BottomModal visible={modal === 'income'} onClose={() => { setModal(null); resetForms(); }} title={editIncomeId ? t('editIncomeModal') : t('addIncomeModal')}>
        <ErrorBox message={error} />
        <FieldLabel>{t('amount')}</FieldLabel>
        <TextInput style={styles.input} value={incForm.amount} onChangeText={(v) => setIncForm((f) => ({ ...f, amount: v }))} keyboardType="numeric" placeholder="₹" placeholderTextColor={Colors.gray400} />
        <DatePickerField value={incForm.date} onChange={(v) => setIncForm((f) => ({ ...f, date: v }))} label={t('date')} style={{ marginBottom: 10 }} />
        <FieldLabel>{t('paymentMethod')}</FieldLabel>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {['Cash', 'Online'].map((m) => (
            <TouchableOpacity key={m} style={[styles.optBtn, incForm.paymentMode === m && styles.optBtnActive]} onPress={() => setIncForm((f) => ({ ...f, paymentMode: m }))}>
              <Text style={[styles.optBtnText, incForm.paymentMode === m && { color: Colors.white }]}>{m === 'Cash' ? t('cash') : t('online')}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FieldLabel>{t('remarks')}</FieldLabel>
        <TextInput style={styles.input} value={incForm.remarks} onChangeText={(v) => setIncForm((f) => ({ ...f, remarks: v }))} placeholder={t('optional')} placeholderTextColor={Colors.gray400} />
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.green, marginTop: 16 }, saving && { opacity: 0.6 }]} onPress={saveIncome} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? t('saveDot') : t('save')}</Text>
        </TouchableOpacity>
      </BottomModal>

      {/* Material Expense Modal */}
      <BottomModal visible={modal === 'expense'} onClose={() => { setModal(null); resetForms(); }} title={editExpenseId ? t('editExpenseModal') : t('addMaterialModal')}>
        <ErrorBox message={error} />
        <FieldLabel>{t('category')}</FieldLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {EXPENSE_CATS.map((c) => (
            <TouchableOpacity key={c} style={[styles.catChip, expForm.remarks === c && styles.catChipActive]} onPress={() => setExpForm((f) => ({ ...f, remarks: c }))}>
              <Text style={[styles.catChipText, expForm.remarks === c && { color: Colors.white }]}>{expLabel(c)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FieldLabel>{t('amount')}</FieldLabel>
        <TextInput style={styles.input} value={expForm.amount} onChangeText={(v) => setExpForm((f) => ({ ...f, amount: v }))} keyboardType="numeric" placeholder="₹" placeholderTextColor={Colors.gray400} />
        <DatePickerField value={expForm.date} onChange={(v) => setExpForm((f) => ({ ...f, date: v }))} label={t('date')} style={{ marginBottom: 10 }} />
        <FieldLabel>{t('note')}</FieldLabel>
        <TextInput style={styles.input} value={expForm.notes} onChangeText={(v) => setExpForm((f) => ({ ...f, notes: v }))} placeholder={t('optional')} placeholderTextColor={Colors.gray400} />
        {vendors.length > 0 && (
          <>
            <FieldLabel>{t('vendor_select') || 'Select Vendor (optional)'}</FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <TouchableOpacity
                style={[styles.catChip, !expForm.vendorId && styles.catChipActive]}
                onPress={() => setExpForm((f) => ({ ...f, vendorId: '' }))}
              >
                <Text style={[styles.catChipText, !expForm.vendorId && { color: Colors.white }]}>
                  — {t('none') || 'None'} —
                </Text>
              </TouchableOpacity>
              {vendors.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.catChip, String(v.id) === String(expForm.vendorId) && styles.catChipActive]}
                  onPress={() => setExpForm((f) => ({ ...f, vendorId: String(v.id) }))}
                >
                  <Text style={[styles.catChipText, String(v.id) === String(expForm.vendorId) && { color: Colors.white }]}>
                    {v.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.red, marginTop: 16 }, saving && { opacity: 0.6 }]} onPress={saveExpense} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? t('saveDot') : t('save')}</Text>
        </TouchableOpacity>
      </BottomModal>

      {/* Contract Expense Modal */}
      <BottomModal visible={modal === 'contract'} onClose={() => { setModal(null); resetForms(); }} title={editExpenseId ? t('editContractModal') : t('addContractModal')}>
        <ErrorBox message={error} />
        {contractTrades.length === 0 ? (
          <Text style={{ color: Colors.amber, fontSize: 13 }}>{t('addContractTypesFirst')}</Text>
        ) : (
          <>
            <FieldLabel>{t('contractType')}</FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {contractTrades.map((ct) => (
                <TouchableOpacity key={ct.id} style={[styles.catChip, String(ct.id) === String(conForm.contractTradeId) && styles.catChipAmber]} onPress={() => setConForm((f) => ({ ...f, contractTradeId: String(ct.id), contractorId: '' }))}>
                  <Text style={[styles.catChipText, String(ct.id) === String(conForm.contractTradeId) && { color: Colors.white }]}>{ct.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {conForm.contractTradeId ? (
              <>
                <FieldLabel>{t('selectContractor')}</FieldLabel>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {contractorsForTrade.map((c) => (
                    <TouchableOpacity key={c.id} style={[styles.catChip, String(c.id) === String(conForm.contractorId) && styles.catChipActive]} onPress={() => setConForm((f) => ({ ...f, contractorId: String(c.id) }))}>
                      <Text style={[styles.catChipText, String(c.id) === String(conForm.contractorId) && { color: Colors.white }]}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {contractorsForTrade.length === 0 && <Text style={{ color: Colors.amber, fontSize: 12 }}>{t('noContractorOfType')}</Text>}
                </ScrollView>
              </>
            ) : null}
          </>
        )}
        <FieldLabel>{t('amount')}</FieldLabel>
        <TextInput style={styles.input} value={conForm.amount} onChangeText={(v) => setConForm((f) => ({ ...f, amount: v }))} keyboardType="numeric" placeholder="₹" placeholderTextColor={Colors.gray400} />
        <DatePickerField value={conForm.date} onChange={(v) => setConForm((f) => ({ ...f, date: v }))} label={t('date')} style={{ marginBottom: 10 }} />
        <FieldLabel>{t('note')}</FieldLabel>
        <TextInput style={styles.input} value={conForm.notes} onChangeText={(v) => setConForm((f) => ({ ...f, notes: v }))} placeholder={t('optional')} placeholderTextColor={Colors.gray400} />
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#d97706', marginTop: 16 }, saving && { opacity: 0.6 }]} onPress={saveContract} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? t('saveDot') : t('save')}</Text>
        </TouchableOpacity>
      </BottomModal>

      <ConfirmModal
        visible={!!pendingDelete}
        title={t('deleteEntryTitle')}
        body={t('deleteEntryBody')}
        onConfirm={doDelete}
        onCancel={() => setPendingDelete(null)}
        confirmText={deleting ? t('deleting') : t('delete')}
        cancelText={t('cancel')}
      />
    </SafeAreaView>
  );
}

function FieldLabel({ children }) {
  return <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.gray600, marginBottom: 6 }}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn: { padding: 6, backgroundColor: Colors.gray100, borderRadius: 10 },
  backIcon: { fontSize: 18, color: Colors.gray700 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  subtitle: { fontSize: 13, color: Colors.gray500 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 14, gap: 6, marginBottom: 4 },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center',
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.gray200,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.gray600 },
  grid2: { flexDirection: 'row', gap: 10 },
  statLabel: { fontSize: 12, color: Colors.gray500, textAlign: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  bigValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  addRowBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  addRowBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  iconBtn: { padding: 8, backgroundColor: Colors.gray100, borderRadius: 8 },
  expBadge: { marginTop: 4, alignSelf: 'flex-start', backgroundColor: Colors.redBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  input: {
    borderWidth: 2, borderColor: Colors.gray200, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: Colors.gray800,
    backgroundColor: Colors.white, marginBottom: 10,
  },
  optBtn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center', backgroundColor: Colors.gray100 },
  optBtnActive: { backgroundColor: Colors.primary },
  optBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.gray200, backgroundColor: Colors.white, marginRight: 6, marginBottom: 6,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipAmber: { backgroundColor: '#d97706', borderColor: '#d97706' },
  catChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
