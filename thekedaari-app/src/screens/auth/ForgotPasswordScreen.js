import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../theme/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const { lang, switchLang, t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    
    // basic validation
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      await client.post('/auth/forgot-password', { phone: cleanedPhone });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
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
            {submitted ? (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={50} color={Colors.green} />
                </View>
                <Text style={styles.successTitle}>Request Sent</Text>
                <Text style={styles.successBody}>
                  If an account exists for this number, we will contact you or reset the password shortly.
                </Text>
                <TouchableOpacity
                  style={[styles.submitBtn, { marginTop: 20 }]}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={20} color={Colors.white} />
                  <Text style={styles.submitText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logoBig}
                  resizeMode="contain"
                />
                <Text style={styles.subtitle}>Reset your password</Text>

                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={Colors.red} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputInner}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder={t('phonePlaceholder') || 'Phone Number'}
                    placeholderTextColor="#94a3b8"
                    maxLength={10}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={20} color={Colors.white} />
                  <Text style={styles.submitText}>{loading ? t('loading') || 'Loading...' : 'Submit'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { padding: 4 },
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
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, width: '100%', marginTop: 4, marginBottom: 16,
  },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  successIcon: {
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 50,
    marginBottom: 16,
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800, marginBottom: 8 },
  successBody: { fontSize: 14, color: Colors.gray600, textAlign: 'center', lineHeight: 20 },
});
