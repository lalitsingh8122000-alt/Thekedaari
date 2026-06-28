import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, TextInput, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { Colors } from '../../theme/colors';
import { Card, AttendanceSkeleton, DatePickerField } from '../../components';
import { useLanguage } from '../../context/LanguageContext';
import AttendanceModal from '../workers/AttendanceModal';

// Inline skeleton — no SafeAreaView so it's safe inside a parent screen
function WorkerTabSkeleton() {
  const anim = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.85, duration: 850, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.45, duration: 850, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const SB = ({ s }) => <View style={[{ backgroundColor: Colors.gray200, borderRadius: 8 }, s]} />;
  return (
    <Animated.View style={{ opacity: anim, padding: 14, gap: 10 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={skStyles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <SB s={{ width: 44, height: 44, borderRadius: 22 }} />
            <View style={{ flex: 1, gap: 6 }}>
              <SB s={{ width: '60%', height: 15, borderRadius: 6 }} />
              <SB s={{ width: '40%', height: 12, borderRadius: 6 }} />
            </View>
            <SB s={{ width: 44, height: 22, borderRadius: 20 }} />
          </View>
          <SB s={{ height: 42, borderRadius: 10 }} />
        </View>
      ))}
    </Animated.View>
  );
}
const skStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.cardBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
});

export default function ProjectAttendanceScreen({ route, navigation }) {
  const { t } = useLanguage();
  const { id, name } = route.params;
  const typeLabel = (type) => ({ FullDay: t('fullDay'), HalfDay: t('halfDay'), Absent: t('absent'), Other: t('other') }[type] || type);

  // Tab: 'mark' | 'records'
  const [tab, setTab] = useState('mark');

  // Mark tab state
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [workersRefreshing, setWorkersRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showAttModal, setShowAttModal] = useState(null);

  // Records tab state
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsRefreshing, setRecordsRefreshing] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadWorkers = async (isRefresh = false) => {
    if (isRefresh) setWorkersRefreshing(true);
    try {
      const res = await client.get('/workers', { params: { status: 'Active' } });
      setWorkers(Array.isArray(res.data) ? res.data : []);
    } catch { setWorkers([]); }
    finally { setWorkersLoading(false); setWorkersRefreshing(false); }
  };

  const loadRecords = async (isRefresh = false) => {
    if (isRefresh) setRecordsRefreshing(true);
    try {
      const res = await client.get('/attendance', {
        params: { projectId: id, startDate: date, endDate: date },
      });
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch { setRecords([]); }
    finally { setRecordsLoading(false); setRecordsRefreshing(false); }
  };

  // Load on screen focus (or projectId change)
  useFocusEffect(useCallback(() => {
    setWorkersLoading(true);
    setRecordsLoading(true);
    loadWorkers();
    loadRecords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]));

  // Reload records whenever the selected date changes
  useEffect(() => {
    setRecordsLoading(true);
    loadRecords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const filteredWorkers = useMemo(() => {
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

  const present = records.filter((r) => r.type !== 'Absent');
  const absent = records.filter((r) => r.type === 'Absent');

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{t('siteAttendance')}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{name}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'mark' && styles.tabActive]}
          onPress={() => setTab('mark')}
        >
          <Text style={[styles.tabText, tab === 'mark' && styles.tabTextActive]}>
            📋 {t('markAttendanceTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'records' && styles.tabActive]}
          onPress={() => setTab('records')}
        >
          <Text style={[styles.tabText, tab === 'records' && styles.tabTextActive]}>
            📅 {t('viewRecordsTab')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── MARK TAB ── */}
      {tab === 'mark' && (
        <>
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

          {workersLoading ? <WorkerTabSkeleton /> : (
            <FlatList
              data={filteredWorkers}
              keyExtractor={(w) => String(w.id)}
              contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 10 }}
              showsVerticalScrollIndicator={false}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={8}
              removeClippedSubviews={true}
              refreshControl={
                <RefreshControl refreshing={workersRefreshing} onRefresh={() => loadWorkers(true)} colors={[Colors.primary]} />
              }
              ListEmptyComponent={
                <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>👷</Text>
                  <Text style={{ color: Colors.gray400 }}>
                    {search ? t('noWorkerFound') : t('noActiveWorkers')}
                  </Text>
                </Card>
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
                    <View style={[styles.badge, styles.badgeActive]}>
                      <Text style={[styles.badgeText, { color: Colors.green }]}>{t('active')}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.markBtn}
                    onPress={() => setShowAttModal(w)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.markBtnText}>📅 {t('markAttendance')}</Text>
                  </TouchableOpacity>
                </Card>
              )}
            />
          )}

          {showAttModal && (
            <AttendanceModal
              worker={showAttModal}
              preselectedProjectId={id}
              onClose={() => setShowAttModal(null)}
              onSaved={() => {
                setShowAttModal(null);
                loadWorkers();
                setRecordsLoading(true);
                loadRecords();
              }}
            />
          )}
        </>
      )}

      {/* ── RECORDS TAB ── */}
      {tab === 'records' && (
        <>
          <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
            <DatePickerField
              value={date}
              onChange={setDate}
              label={t('date')}
            />
          </View>

          {recordsLoading ? <AttendanceSkeleton /> : (
            <FlatList
              data={records}
              keyExtractor={(r) => String(r.id)}
              contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 8 }}
              showsVerticalScrollIndicator={false}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              removeClippedSubviews={true}
              refreshControl={
                <RefreshControl refreshing={recordsRefreshing} onRefresh={() => loadRecords(true)} colors={[Colors.primary]} />
              }
              ListHeaderComponent={records.length > 0 ? (
                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <Text style={[styles.statNum, { color: Colors.green }]}>{present.length}</Text>
                    <Text style={styles.statLbl}>{t('present')}</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Text style={[styles.statNum, { color: Colors.red }]}>{absent.length}</Text>
                    <Text style={styles.statLbl}>{t('absent')}</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Text style={[styles.statNum, { color: Colors.primary }]}>
                      ₹{records.reduce((s, r) => s + (r.salary || 0), 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.statLbl}>{t('totalSalary')}</Text>
                  </View>
                </View>
              ) : null}
              ListEmptyComponent={
                <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>📅</Text>
                  <Text style={{ color: Colors.gray400 }}>{t('noAttendanceOnDate')}</Text>
                </Card>
              }
              renderItem={({ item: r }) => (
                <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={styles.workerAvatarSm}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primaryDark }}>
                      {(r.worker?.name || '?').charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.gray800 }}>{r.worker?.name}</Text>
                    <Text style={{ fontSize: 11, color: Colors.gray500 }}>
                      {r.worker?.role?.name}
                      {r.isSplitHalfDay ? ` · ${t('twoSites')}` : ''}
                    </Text>
                    {r.payment > 0 && (
                      <Text style={{ fontSize: 11, color: '#ea580c', marginTop: 2 }}>
                        💸 {t('paid')}: ₹{(r.payment || 0).toLocaleString('en-IN')}
                        {r.paymentNote ? ` · ${r.paymentNote}` : ''}
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={[styles.typeBadge, r.type === 'Absent' ? styles.typeBadgeAbsent : styles.typeBadgePresent]}>
                      <Text style={[styles.typeBadgeText, { color: r.type === 'Absent' ? Colors.red : Colors.green }]}>
                        {typeLabel(r.type)}
                      </Text>
                    </View>
                    {r.type !== 'Absent' && (
                      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary, marginTop: 4 }}>
                        ₹{(r.salary || 0).toLocaleString('en-IN')}
                      </Text>
                    )}
                  </View>
                </Card>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn: { padding: 6, backgroundColor: Colors.gray100, borderRadius: 10 },
  backIcon: { fontSize: 18, color: Colors.gray700 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800 },
  subtitle: { fontSize: 13, color: Colors.gray500 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 10,
    backgroundColor: Colors.gray100, borderRadius: 12, padding: 4,
  },
  tab: {
    flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10,
  },
  tabActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.gray500 },
  tabTextActive: { color: Colors.primary },
  searchWrap: { paddingHorizontal: 14, marginBottom: 8 },
  searchInput: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray200,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.gray800,
  },
  filterLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray600, marginBottom: 6 },
  workerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primaryDark },
  workerName: { fontSize: 15, fontWeight: '700', color: Colors.gray800 },
  workerSub: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeActive: { backgroundColor: Colors.greenLight },
  badgeText: { fontSize: 11, fontWeight: '700' },
  markBtn: {
    backgroundColor: Colors.greenBg, borderRadius: 10, paddingVertical: 11,
    alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0',
  },
  markBtnText: { fontSize: 14, fontWeight: '700', color: Colors.green },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statPill: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.gray100,
  },
  statNum: { fontSize: 16, fontWeight: '800' },
  statLbl: { fontSize: 11, color: Colors.gray500, marginTop: 2 },
  workerAvatarSm: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  typeBadgePresent: { backgroundColor: Colors.greenLight },
  typeBadgeAbsent: { backgroundColor: Colors.redLight },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
});
