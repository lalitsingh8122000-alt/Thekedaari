import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Card, ProjectListSkeleton, EmptyState, ChipButton } from '../../components';

export default function ProjectsScreen({ navigation }) {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  const typeLabel = (tp) => ({ Small: t('small'), Medium: t('medium'), Big: t('big') }[tp] || tp);
  const statusLabel = (s) => ({ Running: t('running'), Completed: t('completed') }[s] || s);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.type = filterType;
    try {
      const res = await client.get('/projects', { params });
      setProjects(res.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [filterStatus, filterType]));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.type || '').toLowerCase().includes(q)
    );
  }, [projects, search]);

  if (loading) return <ProjectListSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>{t('projects')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ProjectForm', { project: null })}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ {t('add')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['', 'Running', 'Completed'].map((s) => (
          <ChipButton
            key={s}
            title={s === '' ? t('all') : statusLabel(s)}
            active={filterStatus === s}
            onPress={() => setFilterStatus(s)}
          />
        ))}
        <View style={styles.sep} />
        {['', 'Small', 'Medium', 'Big'].map((tp) => (
          <ChipButton
            key={tp}
            title={tp === '' ? t('all') : typeLabel(tp)}
            active={filterType === tp}
            onPress={() => setFilterType(tp)}
          />
        ))}
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchProject')}
          placeholderTextColor={Colors.gray400}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => String(p.id)}
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
        ListEmptyComponent={<EmptyState icon="🏗️" text={search ? t('noProjectFound') : t('noProjects')} />}
        renderItem={({ item: p }) => (
          <Card>
            <View style={styles.projHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.projName} numberOfLines={2}>{p.name}</Text>
                <View style={styles.badges}>
                  <View style={[styles.badge, p.status === 'Running' ? styles.badgeRunning : styles.badgeDone]}>
                    <Text style={[styles.badgeText, { color: p.status === 'Running' ? Colors.green : Colors.gray600 }]}>
                      {statusLabel(p.status)}
                    </Text>
                  </View>
                  <View style={styles.badgeBlue}>
                    <Text style={[styles.badgeText, { color: Colors.primary }]}>{typeLabel(p.type)}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.gray100 }]}
                onPress={() => navigation.navigate('ProjectForm', { project: p })}
              >
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={[styles.actionLabel, { color: Colors.gray700 }]}>{t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.greenBg }]}
                onPress={() => navigation.navigate('ProjectFinance', { id: p.id, name: p.name })}
              >
                <Text style={styles.actionIcon}>₹</Text>
                <Text style={[styles.actionLabel, { color: Colors.green }]}>{t('finance')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.emeraldBg }]}
                onPress={() => navigation.navigate('ProjectAttendance', { id: p.id, name: p.name })}
              >
                <Text style={styles.actionIcon}>📅</Text>
                <Text style={[styles.actionLabel, { color: Colors.emerald }]}>{t('attendance')}</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 14, marginBottom: 8, flexWrap: 'wrap', gap: 4 },
  sep: { width: 1, backgroundColor: Colors.gray200, marginHorizontal: 4 },
  searchWrap: { paddingHorizontal: 14, marginBottom: 6 },
  searchInput: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray200,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.gray800,
  },
  projHeader: { marginBottom: 10 },
  projName: { fontSize: 16, fontWeight: '700', color: Colors.gray800, marginBottom: 6 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeRunning: { backgroundColor: Colors.greenLight },
  badgeDone: { backgroundColor: Colors.gray100 },
  badgeBlue: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: Colors.blueBg },
  badgeText: { fontSize: 11, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionIcon: { fontSize: 16 },
  actionLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
