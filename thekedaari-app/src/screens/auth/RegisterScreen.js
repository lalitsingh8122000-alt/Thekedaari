import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { lang, switchLang, t } = useLanguage();
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (loading) return;
    setError('');
    if (!form.name.trim() || !form.phone.trim() || !form.password || !form.confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }
    if (form.name.trim().length < 2) { setError(t('nameTooShort')); return; }
    if (form.password.length < 6) { setError(t('passwordTooShort')); return; }
    if (form.password !== form.confirmPassword) { setError(t('passwordMismatch')); return; }
    setLoading(true);
    try {
      await register(form.name.trim(), form.phone.trim(), form.password, form.confirmPassword);
    } catch (err) {
      setError(err.response?.data?.error || t('registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Blue top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topBarLeft}>
          <View style={styles.logoSmallWrap}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoSmall}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.topBarTitle}>Thekedaari</Text>
        </View>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => switchLang(lang === 'hi' ? 'en' : 'hi')}
          activeOpacity={0.8}
        >
          <Text style={styles.langBtnText}>{lang === 'hi' ? 'English' : 'हिंदी'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoBig}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>{t('registerSubtitle')}</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Name */}
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                value={form.name}
                onChangeText={set('name')}
                placeholder={t('namePlaceholder')}
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                value={form.phone}
                onChangeText={set('phone')}
                keyboardType="phone-pad"
                placeholder={t('phonePlaceholder')}
                placeholderTextColor="#94a3b8"
                maxLength={10}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                value={form.password}
                onChangeText={set('password')}
                secureTextEntry={!showPassword}
                placeholder={t('password')}
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.gray400}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                value={form.confirmPassword}
                onChangeText={set('confirmPassword')}
                secureTextEntry={!showConfirm}
                placeholder={t('confirmPasswordPlaceholder')}
                placeholderTextColor="#94a3b8"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.gray400}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={20} color={Colors.white} />
              <Text style={styles.submitText}>{loading ? t('registering') : t('registerBtn')}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
              <Text style={styles.linkText}>
                {t('haveAccount')}{' '}
                <Text style={styles.linkAccent}>{t('loginBtn')}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>{t('tagline')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoSmallWrap: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', padding: 5,
  },
  logoSmall: { width: 32, height: 32 },
  topBarTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
  },
  langBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },

  kav: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
  },
  logoBig: { width: 110, height: 74, marginBottom: 4 },
  subtitle: {
    fontSize: 14, color: Colors.gray500, marginBottom: 18,
    textAlign: 'center', fontWeight: '500', lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fee2e2',
    borderRadius: 10, padding: 10, marginBottom: 12, width: '100%',
  },
  errorText: { color: Colors.red, fontSize: 13, flex: 1, lineHeight: 18 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, backgroundColor: '#f8fafc',
    paddingHorizontal: 12, marginBottom: 12, width: '100%',
  },
  inputIcon: { marginRight: 8 },
  inputInner: { flex: 1, paddingVertical: 13, fontSize: 16, color: Colors.gray800 },
  eyeBtn: { padding: 4 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, width: '100%', marginTop: 4, marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  divider: { width: '100%', height: 1, backgroundColor: Colors.gray100, marginBottom: 16 },
  linkRow: { alignItems: 'center' },
  linkText: { fontSize: 14, color: Colors.gray600, textAlign: 'center' },
  linkAccent: { color: Colors.primary, fontWeight: '700' },

  footer: { fontSize: 12, color: Colors.gray400, textAlign: 'center', marginTop: 20 },
});
