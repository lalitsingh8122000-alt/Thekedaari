import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { ErrorBox, DatePickerField } from '../../components';

const PROJECT_TYPES = ['Small', 'Medium', 'Big'];

export default function ProjectFormScreen({ route, navigation }) {
  const { t } = useLanguage();
  const existing = route.params?.project || null;
  const isEdit = !!existing;

  const typeLabel = (tp) => ({ Small: t('small'), Medium: t('medium'), Big: t('big') }[tp] || tp);

  const [form, setForm] = useState({
    name: existing?.name || '',
    startDate: existing?.startDate ? existing.startDate.slice(0, 10) : new Date().toISOString().split('T')[0],
    expectedEndDate: existing?.expectedEndDate ? existing.expectedEndDate.slice(0, 10) : '',
    type: existing?.type || 'Small',
    status: existing?.status || 'Running',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (saving) return;
    setError('');
    if (!form.name.trim()) { setError(t('enterProjectName')); return; }
    if (!form.startDate) { setError(t('enterStartDate')); return; }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        startDate: form.startDate,
        type: form.type,
        ...(form.expectedEndDate ? { expectedEndDate: form.expectedEndDate } : {}),
        ...(isEdit ? { status: form.status } : {}),
      };
      if (isEdit) {
        await client.put(`/projects/${existing.id}`, body);
      } else {
        await client.post('/projects', body);
      }
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.error || t('saveErrorShort'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{isEdit ? t('editProject') : t('newProject')}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ErrorBox message={error} />

          <Field label={t('projectName')}>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={set('name')}
              placeholder={t('projectNamePlaceholder')}
              placeholderTextColor={Colors.gray400}
            />
          </Field>

          <Field label={t('startDate')}>
            <DatePickerField
              value={form.startDate}
              onChange={set('startDate')}
            />
          </Field>

          <Field label={t('endDate')}>
            <DatePickerField
              value={form.expectedEndDate}
              onChange={set('expectedEndDate')}
              allowEmpty
            />
          </Field>

          <Field label={t('projectSize')}>
            <View style={styles.row3}>
              {PROJECT_TYPES.map((tp) => (
                <TouchableOpacity
                  key={tp}
                  style={[styles.typeBtn, form.type === tp && styles.typeBtnActive]}
                  onPress={() => setForm((f) => ({ ...f, type: tp }))}
                >
                  <Text style={[styles.typeBtnText, form.type === tp && { color: Colors.white }]}>
                    {typeLabel(tp)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          {isEdit && (
            <Field label={t('status')}>
              <View style={styles.row2}>
                {['Running', 'Completed'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, form.status === s && (s === 'Running' ? styles.statusRunning : styles.statusDone)]}
                    onPress={() => setForm((f) => ({ ...f, status: s }))}
                  >
                    <Text style={[styles.statusText, form.status === s && { color: Colors.white }]}>
                      {s === 'Running' ? t('running') : t('completed')}
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
  row2: { flexDirection: 'row', gap: 8 },
  row3: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, borderRadius: 12, paddingVertical: 11, alignItems: 'center', backgroundColor: Colors.gray100 },
  typeBtnActive: { backgroundColor: Colors.primary },
  typeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.gray500 },
  statusBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  statusRunning: { backgroundColor: Colors.green },
  statusDone: { backgroundColor: Colors.gray500 },
  statusText: { fontSize: 14, fontWeight: '700', color: Colors.gray500 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
