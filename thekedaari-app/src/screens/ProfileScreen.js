import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../theme/colors';
import { Card } from '../components';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { lang, switchLang, t } = useLanguage();

  const handleLogout = () => {
    Alert.alert(t('logoutTitle'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logoutBtn'), style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t('profile')}</Text>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || '—'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '—'}</Text>
        </Card>

        {/* Language Toggle */}
        <Card>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langOption, lang === 'hi' && styles.langOptionActive]}
              onPress={() => switchLang('hi')}
            >
              <Text style={[styles.langOptionText, lang === 'hi' && styles.langOptionTextActive]}>हिंदी</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langOption, lang === 'en' && styles.langOptionActive]}
              onPress={() => switchLang('en')}
            >
              <Text style={[styles.langOptionText, lang === 'en' && styles.langOptionTextActive]}>English</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>{t('appInfo')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('appNameLabel')}</Text>
            <Text style={styles.infoValue}>{t('appName')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('version')}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 80, gap: 12 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800, marginBottom: 4 },
  profileCard: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: Colors.primaryDark },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  userPhone: { fontSize: 15, color: Colors.gray500, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray700, marginBottom: 10 },
  langRow: { flexDirection: 'row', gap: 10 },
  langOption: {
    flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
    backgroundColor: Colors.gray100, borderWidth: 1.5, borderColor: Colors.gray200,
  },
  langOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  langOptionText: { fontSize: 15, fontWeight: '700', color: Colors.gray500 },
  langOptionTextActive: { color: Colors.white },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  infoLabel: { fontSize: 13, color: Colors.gray500, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: Colors.gray700, flex: 2, textAlign: 'right' },
  hintText: { fontSize: 12, color: Colors.gray500, lineHeight: 18 },
  logoutBtn: {
    backgroundColor: Colors.redLight, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { color: Colors.red, fontSize: 16, fontWeight: '700' },
});
