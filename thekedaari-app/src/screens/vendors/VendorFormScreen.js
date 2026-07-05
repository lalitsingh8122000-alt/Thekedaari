import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components';

export default function VendorFormScreen({ route, navigation }) {
  const { t } = useLanguage();
  const vendor = route.params?.vendor || null;
  const isEdit = !!vendor;

  const [form, setForm] = useState({
    name: vendor?.name || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
    notes: vendor?.notes || '',
    status: vendor?.status || 'Active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (saving) return;
    setError('');
    
    if (form.name.trim().length < 2) {
      setError(t('vendor_name_required') || 'Vendor name must be at least 2 characters');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
        status: form.status,
      };

      if (isEdit) {
        await client.put(`/vendors/${vendor.id}`, payload);
      } else {
        await client.post('/vendors', payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save vendor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? (t('edit_vendor') || 'Edit Vendor') : (t('add_vendor') || 'Add Vendor')}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card style={styles.formCard}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>{t('vendor_name') || 'Vendor Name'} <Text style={{ color: Colors.red }}>*</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={Colors.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(val) => setForm({ ...form, name: val })}
                  placeholder={t('vendor_name') || 'Enter name'}
                  placeholderTextColor={Colors.gray400}
                  maxLength={100}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('vendor_phone') || 'Phone Number'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={18} color={Colors.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(val) => setForm({ ...form, phone: val })}
                  placeholder={t('vendor_phone') || 'Enter phone'}
                  placeholderTextColor={Colors.gray400}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('vendor_address') || 'Address'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="location-outline" size={18} color={Colors.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.address}
                  onChangeText={(val) => setForm({ ...form, address: val })}
                  placeholder={t('vendor_address') || 'Enter address'}
                  placeholderTextColor={Colors.gray400}
                  maxLength={250}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('vendor_notes') || 'Notes'}</Text>
              <View style={[styles.inputWrap, { height: 100, alignItems: 'flex-start', paddingTop: 10 }]}>
                <Ionicons name="document-text-outline" size={18} color={Colors.gray400} style={[styles.inputIcon, { marginTop: 2 }]} />
                <TextInput
                  style={[styles.input, { textAlignVertical: 'top', height: 80 }]}
                  value={form.notes}
                  onChangeText={(val) => setForm({ ...form, notes: val })}
                  placeholder={t('vendor_notes') || 'Any extra details...'}
                  placeholderTextColor={Colors.gray400}
                  multiline
                  maxLength={1000}
                />
              </View>
            </View>

            {isEdit && (
              <View style={styles.field}>
                <Text style={styles.label}>{t('status') || 'Status'}</Text>
                <View style={styles.statusRow}>
                  {['Active', 'Inactive'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      activeOpacity={0.7}
                      style={[
                        styles.statusBtn,
                        form.status === s && (s === 'Active' ? styles.statusActive : styles.statusInactive),
                      ]}
                      onPress={() => setForm({ ...form, status: s })}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          form.status === s ? styles.statusTextSelected : null,
                        ]}
                      >
                        {s === 'Active' ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </Card>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="save" size={20} color={Colors.white} />
            <Text style={styles.saveBtnText}>
              {saving ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 8, paddingBottom: 10,
  },
  backBtn: { padding: 4, marginRight: 8, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  scroll: { padding: 16, paddingBottom: 60, gap: 16 },
  formCard: { padding: 20 },
  
  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: Colors.redBg, borderWidth: 1, borderColor: Colors.redLight,
    padding: 12, borderRadius: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.red, flex: 1 },

  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.gray700, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray50,
    borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: 12, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: Colors.gray800, paddingVertical: 12 },

  statusRow: { flexDirection: 'row', gap: 10 },
  statusBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.gray100, alignItems: 'center',
  },
  statusActive: { backgroundColor: Colors.green },
  statusInactive: { backgroundColor: Colors.gray600 },
  statusText: { fontSize: 14, fontWeight: '700', color: Colors.gray600 },
  statusTextSelected: { color: Colors.white },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: Colors.white },
});
