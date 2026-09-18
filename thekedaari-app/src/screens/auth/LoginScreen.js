import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../theme/colors';
import { SUPPORTED_LANGUAGES } from '../../i18n/translations';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { lang, switchLang, t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (loading) return;
    setError('');
    if (!phone.trim() || !password) {
      setError(t('phoneRequired'));
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), password);
    } catch (err) {
      setError(err.response?.data?.error || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.label || 'English';

  return (
    <View style={{ flex: 1 }}>
      {/* Blue top bar — covers status bar + nav bar */}
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
          onPress={() => setLangOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.langBtnText}>{currentLangLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Content area — gray background */}
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
            {/* Logo */}
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoBig}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Phone */}
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                value={phone}
                onChangeText={setPhone}
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder={t('password')}
                placeholderTextColor="#94a3b8"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.gray400}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600' }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={20} color={Colors.white} />
              <Text style={styles.submitText}>{loading ? t('loggingIn') : t('loginBtn')}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
              <Text style={styles.linkText}>
                {t('noAccount')}{' '}
                <Text style={styles.linkAccent}>{t('registerLink')}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>{t('tagline')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Selection Modal */}
      <Modal
        visible={langOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLangOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangOpen(false)}>
          <Pressable style={styles.langModalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.langModalHeader}>
              <Text style={styles.langModalTitle}>{t('language') || 'Language'}</Text>
              <TouchableOpacity onPress={() => setLangOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.gray800} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.langList}
              showsVerticalScrollIndicator={false}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  style={[
                    styles.langItem,
                    lang === l.code && styles.langItemActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    switchLang(l.code);
                    setLangOpen(false);
                  }}
                >
                  <Text style={[
                    styles.langItemText,
                    lang === l.code && styles.langItemTextActive,
                  ]}>
                    {l.label}
                  </Text>
                  {lang === l.code && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingTop: 32,
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
    paddingTop: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
  },
  logoBig: { width: 130, height: 86, marginBottom: 6 },
  subtitle: {
    fontSize: 14, color: Colors.gray500, marginBottom: 20,
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  langModalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '65%',
    paddingBottom: 24,
  },
  langModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  langModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gray900,
  },
  langList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.gray100,
    borderWidth: 1.5,
    borderColor: Colors.gray100,
  },
  langItemActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  langItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray700,
  },
  langItemTextActive: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
});
