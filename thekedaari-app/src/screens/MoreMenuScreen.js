import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../theme/colors';
import { Card } from '../components';

export default function MoreMenuScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const MENU_ITEMS = [
    { key: 'AttendanceReport', label: t('attendanceReport'), emoji: '📅', desc: t('attendanceReportDesc'), color: Colors.green },
    { key: 'Transactions', label: t('transactions'), emoji: '💰', desc: t('transactionsDesc'), color: Colors.primary },
    { key: 'VendorsList', label: 'Vendors', emoji: '🚚', desc: 'Manage material suppliers', color: '#8b5cf6' },
    { key: 'Roles', label: t('rolesAndContracts'), emoji: '🏷️', desc: t('rolesDesc'), color: Colors.amber },
    { key: 'Profile', label: t('profile'), emoji: '👤', desc: t('profileDesc'), color: Colors.gray500 },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Header */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name || '—'}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t('menu')}</Text>

        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.75}
            onPress={() => navigation.navigate(item.key)}
          >
            <Card style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 80, gap: 8 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.primaryDark },
  userName: { fontSize: 17, fontWeight: '800', color: Colors.gray800 },
  userPhone: { fontSize: 13, color: Colors.gray500, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 0 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuEmoji: { fontSize: 20 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: Colors.gray800 },
  menuDesc: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
  arrow: { fontSize: 22, color: Colors.gray300, fontWeight: '300' },
});
