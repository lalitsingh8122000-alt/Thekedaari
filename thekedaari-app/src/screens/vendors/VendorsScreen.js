import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import {
  Card, WorkerListSkeleton, EmptyState, ChipButton,
} from '../../components';

export default function VendorsScreen({ navigation }) {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Active');
  const [search, setSearch] = useState('');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await client.get('/vendors', { params });
      setVendors(res.data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [filterStatus]));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    const qd = q.replace(/\D/g, '');
    return vendors.filter((v) => {
      if ((v.name || '').toLowerCase().includes(q)) return true;
      const phone = String(v.phone || '').replace(/\D/g, '');
      if (qd.length >= 2 && phone.includes(qd)) return true;
      return false;
    });
  }, [vendors, search]);

  if (loading) return <WorkerListSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>{t('vendors') || 'Vendors'}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('VendorForm', { vendor: null })}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ {t('add') || 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['', 'Active', 'Inactive'].map((s) => (
          <ChipButton
            key={s}
            title={s === '' ? (t('all') || 'All') : s === 'Active' ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
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
          placeholder={t('vendor_name') || 'Search Vendor Name...'}
          placeholderTextColor={Colors.gray400}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(v) => String(v.id)}
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
          <EmptyState icon="🚚" text={search ? (t('no_search_matches') || 'No matches') : (t('no_vendors') || 'No vendors found')} />
        }
        renderItem={({ item: v }) => (
          <Card>
            <View style={styles.vHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{v.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vName} numberOfLines={1}>{v.name}</Text>
                {v.phone && <Text style={styles.vSub}>{v.phone}</Text>}
                {v.address && <Text style={styles.vSub} numberOfLines={1}>{v.address}</Text>}
              </View>
              <View style={[styles.badge, v.status === 'Active' ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, { color: v.status === 'Active' ? Colors.green : Colors.gray500 }]}>
                  {v.status === 'Active' ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
                </Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#f5f3ff' }]}
                onPress={() => navigation.navigate('VendorLedger', { vendorId: v.id, name: v.name })}
              >
                <Text style={styles.actionIcon}>📒</Text>
                <Text style={[styles.actionLabel, { color: '#8b5cf6' }]}>{t('vendor_ledger') || 'Ledger'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.gray100 }]}
                onPress={() => navigation.navigate('VendorForm', { vendor: v })}
              >
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={[styles.actionLabel, { color: Colors.gray700 }]}>{t('edit') || 'Edit'}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
  },
  backBtn: { padding: 4, marginRight: 8, marginLeft: -4 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800, flex: 1 },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 14, marginBottom: 8 },
  searchWrap: { paddingHorizontal: 14, marginBottom: 6 },
  searchInput: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray200,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: Colors.gray800,
  },
  vHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#7e22ce' },
  vName: { fontSize: 15, fontWeight: '700', color: Colors.gray800 },
  vSub: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeActive: { backgroundColor: Colors.greenLight },
  badgeInactive: { backgroundColor: Colors.gray100 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  actionIcon: { fontSize: 16 },
  actionLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
