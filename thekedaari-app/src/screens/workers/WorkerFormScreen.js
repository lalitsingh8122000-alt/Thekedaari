import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { ErrorBox, WorkerFormSkeleton } from '../../components';

export default function WorkerFormScreen({ route, navigation }) {
  const { t } = useLanguage();
  const existing = route.params?.worker || null;
  const isEdit = !!existing;

  const [roles, setRoles] = useState([]);
  const [contractTrades, setContractTrades] = useState([]);
  const [form, setForm] = useState({
    name: existing?.name || '',
    phone: existing?.phone || '',
    costPerDay: existing?.costPerDay != null ? String(existing.costPerDay) : '',
    roleId: existing?.roleId != null ? String(existing.roleId) : '',
    contractTradeId: existing?.contractTradeId != null ? String(existing.contractTradeId) : '',
    status: existing?.status || 'Active',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([client.get('/roles'), client.get('/contract-trades')])
      .then(([r, t]) => { setRoles(r.data); setContractTrades(t.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedRole = roles.find((r) => String(r.id) === String(form.roleId));
  const isContractor = selectedRole?.name?.toLowerCase().includes('contract') ||
    selectedRole?.name?.toLowerCase().includes('ठेक');

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (saving) return;
    setError('');
    if (!form.name.trim()) { setError(t('enterName')); return; }
    if (!form.costPerDay) { setError(t('enterDailyRate')); return; }
    if (!form.roleId) { setError(t('selectRole')); return; }

    const data = new FormData();
    data.append('name', form.name.trim());
    if (form.phone.trim()) data.append('phone', form.phone.trim());
    data.append('costPerDay', parseFloat(form.costPerDay) || 0);
    data.append('roleId', form.roleId);
    data.append('status', form.status);
    if (isContractor && form.contractTradeId) {
      data.append('contractTradeId', form.contractTradeId);
    }

    setSaving(true);
    try {
      if (isEdit) {
        await client.put(`/workers/${existing.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await client.post('/workers', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.error || t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <WorkerFormSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{isEdit ? t('editWorker') : t('addWorker')}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ErrorBox message={error} />

          <Field label={t('workerName')}>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={set('name')}
              placeholder={t('name')}
              placeholderTextColor={Colors.gray400}
            />
          </Field>

          <Field label={t('phone')}>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={set('phone')}
              keyboardType="phone-pad"
              placeholder={t('phonePlaceholder')}
              placeholderTextColor={Colors.gray400}
              maxLength={10}
            />
          </Field>

          <Field label={t('dailyWage')}>
            <TextInput
              style={styles.input}
              value={form.costPerDay}
              onChangeText={set('costPerDay')}
              keyboardType="numeric"
              placeholder={t('dailyWagePlaceholder')}
              placeholderTextColor={Colors.gray400}
            />
          </Field>

          <Field label={t('role')}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.chip, String(r.id) === String(form.roleId) && styles.chipActive]}
                  onPress={() => setForm((f) => ({ ...f, roleId: String(r.id) }))}
                >
                  <Text style={[styles.chipText, String(r.id) === String(form.roleId) && { color: Colors.white }]}>
                    {r.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Field>

          {isContractor && contractTrades.length > 0 && (
            <Field label={t('contractType')}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {contractTrades.map((ct) => (
                  <TouchableOpacity
                    key={ct.id}
                    style={[styles.chip, String(ct.id) === String(form.contractTradeId) && styles.chipAmber]}
                    onPress={() => setForm((f) => ({ ...f, contractTradeId: String(ct.id) }))}
                  >
                    <Text style={[styles.chipText, String(ct.id) === String(form.contractTradeId) && { color: Colors.white }]}>
                      {ct.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Field>
          )}

          {isEdit && (
            <Field label={t('status')}>
              <View style={styles.row2}>
                {['Active', 'Inactive'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusBtn,
                      form.status === s && (s === 'Active' ? styles.statusActive : styles.statusInactive),
                    ]}
                    onPress={() => setForm((f) => ({ ...f, status: s }))}
                  >
                    <Text style={[styles.statusText, form.status === s && { color: Colors.white }]}>
                      {s === 'Active' ? t('active') : t('inactive')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={save}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>{saving ? t('saving') : t('save')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.gray600, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn: { padding: 6, backgroundColor: Colors.gray100, borderRadius: 10 },
  backIcon: { fontSize: 18, color: Colors.gray700 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  content: { padding: 16, paddingBottom: 40 },
  input: {
    borderWidth: 2, borderColor: Colors.gray200, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: Colors.gray800,
    backgroundColor: Colors.white,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.gray200, backgroundColor: Colors.white, marginRight: 6,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipAmber: { backgroundColor: '#d97706', borderColor: '#d97706' },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  row2: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
    backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.gray200,
  },
  statusActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  statusInactive: { backgroundColor: Colors.gray500, borderColor: Colors.gray500 },
  statusText: { fontSize: 14, fontWeight: '700', color: Colors.gray500 },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
