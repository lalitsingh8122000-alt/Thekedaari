import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import {
  Card, WorkerListSkeleton, EmptyState, ChipButton,
} from '../../components';
import AttendanceModal from './AttendanceModal';

export default function WorkersScreen({ navigation }) {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Active');
  const [search, setSearch] = useState('');
  const [showAttModal, setShowAttModal] = useState(null);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await client.get('/workers', { params });
      setWorkers(res.data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [filterStatus]));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workers;
    const qd = q.replace(/\D/g, '');
    return workers.filter((w) => {
      if ((w.name || '').toLowerCase().includes(q)) return true;
      if ((w.role?.name || '').toLowerCase().includes(q)) return true;
      const phone = String(w.phone || '').replace(/\D/g, '');
      if (qd.length >= 2 && phone.includes(qd)) return true;
      return false;
    });
  }, [workers, search]);

  if (loading) return <WorkerListSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>{t('workers')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('WorkerForm', { worker: null })}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ {t('add')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['', 'Active', 'Inactive'].map((s) => (
          <ChipButton
            key={s}
            title={s === '' ? t('all') : s === 'Active' ? t('active') : t('inactive')}
            active={filterStatus === s}
            onPress={() => setFilterStatus(s)}
          />
        ))}
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchWorker')}
          placeholderTextColor={Colors.gray400}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(w) => String(w.id)}
        contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 10 }}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={8}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState icon="👷" text={search ? t('noWorkerFound') : t('noWorkers')} />
        }
        renderItem={({ item: w }) => (
          <Card>
            <View style={styles.workerHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{w.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.workerName} numberOfLines={1}>{w.name}</Text>
                <Text style={styles.workerSub}>{w.role?.name} · ₹{w.costPerDay}{t('perDay')}</Text>
              </View>
              <View style={[styles.badge, w.status === 'Active' ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, { color: w.status === 'Active' ? Colors.green : Colors.gray500 }]}>
                  {w.status === 'Active' ? t('active') : t('inactive')}
                </Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.greenBg }]}
                onPress={() => setShowAttModal(w)}
              >
                <Text style={styles.actionIcon}>📅</Text>
                <Text style={[styles.actionLabel, { color: Colors.green }]}>{t('attendance')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.blueBg }]}
                onPress={() => navigation.navigate('WorkerLedger', { workerId: w.id, name: w.name })}
              >
                <Text style={styles.actionIcon}>📒</Text>
                <Text style={[styles.actionLabel, { color: Colors.primary }]}>{t('ledger')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.gray100 }]}
                onPress={() => navigation.navigate('WorkerForm', { worker: w })}
              >
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={[styles.actionLabel, { color: Colors.gray700 }]}>{t('edit')}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      {showAttModal && (
        <AttendanceModal
          worker={showAttModal}
          onClose={() => setShowAttModal(null)}
          onSaved={() => { setShowAttModal(null); load(); }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 14, marginBottom: 8 },
  searchWrap: { paddingHorizontal: 14, marginBottom: 6 },
  searchInput: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.gray800,
  },
  workerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primaryDark },
  workerName: { fontSize: 15, fontWeight: '700', color: Colors.gray800 },
  workerSub: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeActive: { backgroundColor: Colors.greenLight },
  badgeInactive: { backgroundColor: Colors.gray100 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 16 },
  actionLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
