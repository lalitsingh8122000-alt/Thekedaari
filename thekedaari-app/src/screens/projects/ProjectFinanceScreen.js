import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, RefreshControl, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import {
  Card, StatCard, FinanceSkeleton, ErrorBox, BottomModal, ConfirmModal,
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
  const [expForm, setExpForm] = useState({ amount: '', date: '', remarks: '', notes: '' });
  const [conForm, setConForm] = useState({ amount: '', date: '', contractTradeId: '', contractorId: '', notes: '' });

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [s, i, e, w, tr] = await Promise.all([
        client.get(`/finance/projects/${id}/summary`),
        client.get(`/finance/projects/${id}/income`),
        client.get(`/finance/projects/${id}/expenses`),
        client.get('/workers', { params: { status: 'Active' } }),
        client.get('/contract-trades'),
      ]);
      setSummary(s.data);
      setIncomes(i.data);
      setExpenses(e.data);
      setWorkers(Array.isArray(w.data) ? w.data : []);
      setContractTrades(Array.isArray(tr.data) ? tr.data : []);
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
    setExpForm({ amount: '', date: today, remarks: '', notes: '' });
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
      setExpForm({ amount: String(item.amount), date: toDateInput(item.date), remarks: item.remarks || '', notes: item.notes || '' });
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
      const body = { amount, date: expForm.date, remarks: expForm.remarks, notes: expForm.notes.trim() };
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
        <FieldLabel>{t('date')}</FieldLabel>
        <TextInput style={styles.input} value={incForm.date} onChangeText={(v) => setIncForm((f) => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.gray400} keyboardType="numeric" />
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
        <FieldLabel>{t('date')}</FieldLabel>
        <TextInput style={styles.input} value={expForm.date} onChangeText={(v) => setExpForm((f) => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.gray400} keyboardType="numeric" />
        <FieldLabel>{t('note')}</FieldLabel>
        <TextInput style={styles.input} value={expForm.notes} onChangeText={(v) => setExpForm((f) => ({ ...f, notes: v }))} placeholder={t('optional')} placeholderTextColor={Colors.gray400} />
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
        <FieldLabel>{t('date')}</FieldLabel>
        <TextInput style={styles.input} value={conForm.date} onChangeText={(v) => setConForm((f) => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.gray400} keyboardType="numeric" />
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
