import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../theme/colors';
import { Card } from '../components';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { lang, switchLang, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = () => {
    Alert.alert(t('logoutTitle'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logoutBtn'), style: 'destructive', onPress: logout },
    ]);
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.label || 'English';

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

        {/* Language Selection Card */}
        <Card>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <TouchableOpacity
            style={styles.langSelectorRow}
            activeOpacity={0.7}
            onPress={() => setLangOpen(true)}
          >
            <Text style={styles.langSelectorLabel}>{currentLangLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.gray500} />
          </TouchableOpacity>
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
  
  langSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  langSelectorLabel: { fontSize: 15, fontWeight: '700', color: Colors.gray800 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  infoLabel: { fontSize: 13, color: Colors.gray500, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: Colors.gray700, flex: 2, textAlign: 'right' },
  logoutBtn: {
    backgroundColor: Colors.redLight, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { color: Colors.red, fontSize: 16, fontWeight: '700' },

  // Language Modal Styles
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
