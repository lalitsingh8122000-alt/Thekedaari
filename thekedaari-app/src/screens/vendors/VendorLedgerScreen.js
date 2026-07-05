import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Card, LoadingSpinner, EmptyState } from '../../components';

const fmt = (n) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

export default function VendorLedgerScreen({ route, navigation }) {
  const { vendorId, name } = route.params;
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(null); // 'addBill' | 'payVendor'
  const [form, setForm] = useState({ amount: '', category: 'Payment', remarks: '', comment: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [editEntry, setEditEntry] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', remarks: '', comment: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const load = useCallback(() => {
    client.get(`/vendor-ledger/${vendorId}`)
      .then(res => setData(res.data))
      .catch(() => navigation.goBack())
      .finally(() => setLoading(false));
  }, [vendorId, navigation]);

  useEffect(() => { load(); }, [load]);

  const openAddBill = () => {
    setError(''); setSaving(false);
    setForm({ amount: '', category: 'Material', remarks: '', comment: '' });
    setShowModal('addBill');
  };

  const openPayVendor = () => {
    setError(''); setSaving(false);
    setForm({ amount: '', category: 'Payment', remarks: '', comment: '' });
    setShowModal('payVendor');
  };

  const handleAdd = async () => {
    if (saving) return;
    setError('');
    const amountNum = parseFloat(form.amount);
    if (!amountNum || amountNum <= 0) return setError('Please enter a valid amount');

    setSaving(true);
    try {
      await client.post('/vendor-ledger', {
        vendorId: parseInt(vendorId, 10),
        amount: amountNum,
        type: showModal === 'addBill' ? 'Credit' : 'Debit',
        category: form.category,
        remarks: form.remarks.trim(),
        comment: form.comment.trim(),
      });
      setShowModal(null);
      setLoading(true);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (entry) => {
    setEditEntry(entry);
    setEditForm({
      amount: String(entry.amount),
      remarks: entry.remarks || '',
      comment: entry.comment || '',
    });
    setEditError('');
    setEditSaving(false);
  };

  const handleEditSave = async () => {
    if (editSaving) return;
    setEditError('');
    const amountNum = parseFloat(editForm.amount);
    if (!amountNum || amountNum <= 0) return setEditError('Please enter a valid amount');

    setEditSaving(true);
    try {
      await client.put(`/vendor-ledger/${editEntry.id}`, {
        amount: amountNum,
        remarks: editForm.remarks.trim(),
        comment: editForm.comment.trim(),
      });
      setEditEntry(null);
      setLoading(true);
      load();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update entry');
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const bal = data?.currentBalance || 0;
  const isYouOwe = bal > 0;
  const isAdvance = bal < 0;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{t('vendorLedger') || 'Vendor Ledger'}</Text>
          <Text style={styles.headerSub}>{data?.vendor?.name || name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={[styles.balCard, { borderLeftColor: isYouOwe ? Colors.red : isAdvance ? Colors.green : Colors.gray400 }]}>
          <Text style={styles.balLbl}>{t('current_balance') || 'Current Balance'}</Text>
          <Text style={[styles.balVal, { color: isYouOwe ? Colors.red : isAdvance ? Colors.green : Colors.gray700 }]}>
            {fmt(bal)}
          </Text>
          <Text style={styles.balHint}>
            {isYouOwe ? (t('vendorBalanceYouOwe') || 'You need to pay') : isAdvance ? (t('vendorBalanceAdvance') || 'Advance paid') : (t('vendorBalanceSettled') || 'Settled')}
          </Text>
        </Card>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.redBg, borderColor: Colors.redLight }]}
            onPress={openAddBill}
            activeOpacity={0.9}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="trending-up" size={18} color={Colors.red} />
            </View>
            <Text style={[styles.actionBtnText, { color: Colors.redDark }]}>{t('vendorAddBill') || 'Add Bill'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.greenBg, borderColor: Colors.greenLight }]}
            onPress={openPayVendor}
            activeOpacity={0.9}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="cash" size={18} color={Colors.green} />
            </View>
            <Text style={[styles.actionBtnText, { color: Colors.greenDark }]}>{t('vendorRecordPayment') || 'Record Payment'}</Text>
          </TouchableOpacity>
        </View>

        {data?.ledger?.length === 0 ? (
          <EmptyState icon="📒" text={t('no_data') || 'No ledger entries yet'} />
        ) : (
          <View style={styles.list}>
            {data?.ledger?.map((entry) => {
              const isBilled = entry.type === 'Credit';
              return (
                <Card key={entry.id} style={styles.entryCard}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.entryHeaderRow}>
                      <View style={[styles.tag, isBilled ? styles.tagRed : styles.tagGreen]}>
                        <Text style={[styles.tagText, isBilled ? styles.tagTextRed : styles.tagTextGreen]}>
                          {isBilled ? (t('vendorTagBilled') || 'BILLED') : (t('vendorTagPaid') || 'PAID')}
                        </Text>
                      </View>
                      <Text style={styles.entryCat}>
                        {entry.category === 'Material' ? (t('vendorMaterial') || 'Material') : entry.category === 'Payment' ? (t('payment') || 'Payment') : (t('other') || 'Other')}
                      </Text>
                    </View>
                    {(entry.remarks || entry.comment) ? (
                      <Text style={styles.entryRemarks}>
                        {[entry.remarks, entry.comment].filter(Boolean).join(' · ')}
                      </Text>
                    ) : null}
                    <Text style={styles.entryMeta}>
                      {entry.expense?.project ? `${entry.expense.project.name} · ${entry.expense.remarks}\n` : ''}
                      {t('vendorRecordedOn') || 'Recorded on'}: {fmtDate(entry.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.entryRight}>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.entryAmt, { color: isBilled ? Colors.red : Colors.green }]}>
                        {isBilled ? '+' : '−'}{fmt(entry.amount)}
                      </Text>
                      <Text style={styles.entryRunBal}>
                        {t('vendorRunningTotal') || 'Total'}: {fmt(entry.runningBalance)}
                      </Text>
                    </View>
                    {!entry.expense && (
                      <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(entry)}>
                        <Ionicons name="pencil" size={16} color={Colors.gray500} />
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add/Pay Modal */}
      <Modal visible={!!showModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showModal === 'addBill' ? (t('vendorModalBillTitle') || 'Add Vendor Bill') : (t('vendorModalPayTitle') || 'Record Payment to Vendor')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(null)}><Ionicons name="close" size={24} color={Colors.gray500} /></TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              {error ? <Text style={styles.modalError}>{error}</Text> : null}
              
              <Text style={styles.label}>{t('amount') || 'Amount'} (₹)</Text>
              <TextInput
                style={styles.inputLarge}
                keyboardType="numeric"
                value={form.amount}
                onChangeText={(v) => setForm({ ...form, amount: v })}
                placeholder="0"
                placeholderTextColor={Colors.gray300}
              />

              <Text style={styles.label}>{t('remarks') || 'Remarks (Category)'}</Text>
              <View style={styles.chipRow}>
                {(showModal === 'addBill' ? ['Material', 'Other'] : ['Payment', 'Other']).map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, form.category === c && styles.chipActive]}
                    onPress={() => setForm({ ...form, category: c })}
                  >
                    <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>
                      {c === 'Material' ? (t('vendor_material') || 'Material') : c === 'Payment' ? (t('payment') || 'Payment') : (t('other') || 'Other')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{t('comment') || 'Comment / Details'}</Text>
              <TextInput
                style={styles.input}
                value={form.comment}
                onChangeText={(v) => setForm({ ...form, comment: v })}
                placeholder={t('comment') || 'Optional notes...'}
                maxLength={2000}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: showModal === 'addBill' ? Colors.red : Colors.green, marginTop: 20 }]}
                onPress={handleAdd}
                disabled={saving}
              >
                <Text style={styles.submitBtnText}>{saving ? (t('saving') || 'Saving...') : (t('save') || 'Save')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={!!editEntry} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('vendorEditEntry') || 'Edit Entry'}</Text>
              <TouchableOpacity onPress={() => setEditEntry(null)}><Ionicons name="close" size={24} color={Colors.gray500} /></TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              {editError ? <Text style={styles.modalError}>{editError}</Text> : null}
              
              <Text style={styles.label}>{t('amount') || 'Amount'} (₹)</Text>
              <TextInput
                style={styles.inputLarge}
                keyboardType="numeric"
                value={editForm.amount}
                onChangeText={(v) => setEditForm({ ...editForm, amount: v })}
              />

              <Text style={styles.label}>Remarks (Short)</Text>
              <TextInput
                style={styles.input}
                value={editForm.remarks}
                onChangeText={(v) => setEditForm({ ...editForm, remarks: v })}
                placeholder="Optional remarks"
                maxLength={500}
              />

              <Text style={styles.label}>{t('comment') || 'Comment'}</Text>
              <TextInput
                style={styles.input}
                value={editForm.comment}
                onChangeText={(v) => setEditForm({ ...editForm, comment: v })}
                placeholder="Optional details"
                maxLength={2000}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { marginTop: 20 }]}
                onPress={handleEditSave}
                disabled={editSaving}
              >
                <Text style={styles.submitBtnText}>{editSaving ? (t('saving') || 'Saving...') : 'Update Entry'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
  },
  backBtn: { padding: 4, marginRight: 8, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  headerSub: { fontSize: 13, color: Colors.gray500, marginTop: 2 },
  scroll: { padding: 14, paddingBottom: 40, gap: 14 },
  
  balCard: { padding: 16, borderLeftWidth: 4, alignItems: 'center' },
  balLbl: { fontSize: 13, color: Colors.gray500, fontWeight: '600' },
  balVal: { fontSize: 32, fontWeight: '800', marginVertical: 4 },
  balHint: { fontSize: 12 },

  actionGrid: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 56,
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  actionBtnText: { fontSize: 14, fontWeight: '700' },

  list: { gap: 10 },
  entryCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  entryHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagRed: { backgroundColor: Colors.redBg },
  tagGreen: { backgroundColor: Colors.greenBg },
  tagText: { fontSize: 10, fontWeight: '800' },
  tagTextRed: { color: Colors.redDark },
  tagTextGreen: { color: Colors.greenDark },
  entryCat: { fontSize: 13, fontWeight: '700', color: Colors.gray800 },
  entryRemarks: { fontSize: 12, color: Colors.gray600, marginBottom: 4, lineHeight: 18 },
  entryMeta: { fontSize: 11, color: Colors.gray400 },
  
  entryRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  entryAmt: { fontSize: 16, fontWeight: '800', textAlign: 'right' },
  entryRunBal: { fontSize: 11, color: Colors.gray400, marginTop: 2, textAlign: 'right' },
  editBtn: { padding: 8, backgroundColor: Colors.gray50, borderRadius: 10 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.gray800 },
  modalError: { backgroundColor: Colors.redBg, color: Colors.red, padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13, overflow: 'hidden' },
  
  label: { fontSize: 13, fontWeight: '700', color: Colors.gray600, marginBottom: 6, marginTop: 12 },
  inputLarge: {
    backgroundColor: Colors.gray50, borderWidth: 1.5, borderColor: Colors.gray200,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
    fontSize: 24, fontWeight: '800', textAlign: 'center', color: Colors.gray800,
  },
  input: {
    backgroundColor: Colors.gray50, borderWidth: 1.5, borderColor: Colors.gray200,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
    fontSize: 15, color: Colors.gray800,
  },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.gray100, alignItems: 'center' },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  chipTextActive: { color: Colors.white },
  
  submitBtn: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 20,
  },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
