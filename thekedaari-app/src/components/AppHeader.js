import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Modal, Pressable, Alert, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../theme/colors';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { lang, switchLang, t } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const initial = (user?.name || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    setProfileOpen(false);
    Alert.alert(t('logoutTitle'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logoutBtn'), style: 'destructive', onPress: logout },
    ]);
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.label || 'English';

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.left}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Thekedaari</Text>
        </View>
        <View style={styles.right}>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLangOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.langBtnText}>{currentLangLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => setProfileOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Modal */}
      <Modal
        visible={profileOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setProfileOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            {/* Profile header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetAvatar}>
                <Text style={styles.sheetAvatarText}>{initial}</Text>
              </View>
              <Text style={styles.sheetName}>{user?.name}</Text>
              {user?.phone ? (
                <View style={styles.sheetInfoRow}>
                  <Ionicons name="call-outline" size={14} color="rgba(255,255,255,0.75)" />
                  <Text style={styles.sheetInfoText}>{user.phone}</Text>
                </View>
              ) : null}
              {user?.createdAt ? (
                <View style={styles.sheetInfoRow}>
                  <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.75)" />
                  <Text style={styles.sheetInfoText}>
                    {t('memberSince')}: {new Date(user.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Language section */}
            <View style={styles.langSection}>
              <Text style={styles.langSectionLabel}>{t('language')}</Text>
              <TouchableOpacity
                style={styles.langSelectorRow}
                activeOpacity={0.7}
                onPress={() => {
                  setProfileOpen(false);
                  setLangOpen(true);
                }}
              >
                <Text style={styles.langSelectorLabel}>{currentLangLabel}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.gray500} />
              </TouchableOpacity>
            </View>

            {/* Logout */}
            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={18} color={Colors.red} />
                <Text style={styles.logoutText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    padding: 5, overflow: 'hidden',
  },
  logo: { width: 30, height: 30 },
  appName: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
  },
  langBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 14,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: 290,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
  },
  sheetHeader: {
    backgroundColor: Colors.primary,
    padding: 20,
    alignItems: 'center',
  },
  sheetAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  sheetAvatarText: { fontSize: 26, fontWeight: '800', color: Colors.primary },
  sheetName: { fontSize: 17, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  sheetInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  sheetInfoText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  langSection: { padding: 16, paddingBottom: 16 },
  langSectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.gray400,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
  },
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

  sheetFooter: { borderTopWidth: 1, borderTopColor: Colors.gray100, padding: 12 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.redLight, borderRadius: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { color: Colors.red, fontSize: 15, fontWeight: '700' },

  // New Language Selection Modal Styles
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
