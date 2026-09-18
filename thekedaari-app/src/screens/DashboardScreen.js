import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client';
import { Colors } from '../theme/colors';
import { Card, StatCard, DashboardSkeleton } from '../components';
import { useLanguage } from '../context/LanguageContext';

const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

export default function DashboardScreen({ navigation }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await client.get('/dashboard');
      setData(res.data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <DashboardSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
      >
        <Text style={styles.pageTitle}>{t('dashboard')}</Text>

        {data ? (
          <>
            {/* Finance Summary */}
            <View style={styles.grid2}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('ProjectsTab')}>
                <StatCard borderColor={Colors.green} style={styles.flex1}>
                  <Text style={styles.statIcon}>↑</Text>
                  <Text style={styles.statLabel}>{t('totalIncome')}</Text>
                  <Text style={[styles.statValue, { color: Colors.green }]}>{fmt(data.totalIncome)}</Text>
                </StatCard>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('ProjectsTab')}>
                <StatCard borderColor={Colors.red} style={styles.flex1}>
                  <Text style={styles.statIcon}>↓</Text>
                  <Text style={styles.statLabel}>{t('totalExpense')}</Text>
                  <Text style={[styles.statValue, { color: Colors.red }]}>{fmt(data.totalExpense)}</Text>
                </StatCard>
              </TouchableOpacity>
            </View>

            <StatCard borderColor={data.profitLoss >= 0 ? Colors.green : Colors.red} style={styles.profitCard}>
              <Text style={styles.statIcon}>{data.profitLoss >= 0 ? '📈' : '📉'}</Text>
              <Text style={styles.statLabel}>{t('profitLoss')}</Text>
              <Text style={[styles.bigValue, { color: data.profitLoss >= 0 ? Colors.green : Colors.red }]}>
                {fmt(Math.abs(data.profitLoss))}
                <Text style={styles.suffix}> {data.profitLoss >= 0 ? t('profit') : t('loss')}</Text>
              </Text>
            </StatCard>

            {/* Labour */}
            <View style={styles.grid2}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('WorkersTab')}>
                <StatCard borderColor={Colors.emerald} style={styles.flex1}>
                  <Text style={styles.statLabel}>{t('advanceToWorkers')}</Text>
                  <Text style={[styles.statValue, { color: Colors.emerald }]}>{fmt(data.labourPlusAmount)}</Text>
                </StatCard>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('WorkersTab')}>
                <StatCard borderColor={Colors.red} style={styles.flex1}>
                  <Text style={styles.statLabel}>{t('payToWorkers')}</Text>
                  <Text style={[styles.statValue, { color: Colors.red }]}>{fmt(data.labourAmountToPay)}</Text>
                </StatCard>
              </TouchableOpacity>
            </View>

            {/* Today Summary */}
            <View style={styles.grid2}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('WorkersTab')}>
                <StatCard style={styles.flex1}>
                  <Text style={styles.statLabel}>{t('todayAttendance')}</Text>
                  <View style={styles.attendanceRow}>
                    <View style={styles.attItem}>
                      <Text style={[styles.bigNum, { color: Colors.emerald }]}>{data.todayPresent ?? 0}</Text>
                      <Text style={styles.attLabel}>{t('present')}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.attItem}>
                      <Text style={[styles.bigNum, { color: Colors.red }]}>{data.todayAbsent ?? 0}</Text>
                      <Text style={styles.attLabel}>{t('absent')}</Text>
                    </View>
                  </View>
                </StatCard>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <StatCard style={styles.flex1}>
                  <Text style={styles.statIcon}>💰</Text>
                  <Text style={styles.statLabel}>{t('todayExpense')}</Text>
                  <Text style={[styles.statValue, { color: Colors.gray800 }]}>{fmt(data.todayExpense)}</Text>
                </StatCard>
              </View>
            </View>

            <View style={styles.grid2}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('ProjectsTab')}>
                <StatCard style={styles.flex1}>
                  <Text style={styles.statIcon}>🏗️</Text>
                  <Text style={styles.statLabel}>{t('activeProjects')}</Text>
                  <Text style={[styles.bigNum, { color: Colors.gray800 }]}>{data.activeProjects}</Text>
                </StatCard>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('WorkersTab')}>
                <StatCard style={styles.flex1}>
                  <Text style={styles.statIcon}>👷</Text>
                  <Text style={styles.statLabel}>{t('activeWorkers')}</Text>
                  <Text style={[styles.bigNum, { color: Colors.gray800 }]}>{data.activeWorkers}</Text>
                </StatCard>
              </TouchableOpacity>
            </View>

            {/* Top Projects */}
            {data.topProjects?.length > 0 && (
              <Card style={{ marginTop: 4 }}>
                <Text style={styles.sectionTitle}>{t('topProjects')}</Text>
                {data.topProjects.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.projectRow}
                    onPress={() => navigation.navigate('ProjectsTab', {
                      screen: 'ProjectFinance',
                      params: { id: p.id, name: p.name },
                    })}
                  >
                    <Text style={styles.projectName} numberOfLines={1}>{p.name}</Text>
                    <View style={styles.projectAmounts}>
                      <Text style={{ color: Colors.green, fontSize: 13 }}>{fmt(p.totalIncome)}</Text>
                      <Text style={{ color: Colors.gray400, fontSize: 13 }}> / </Text>
                      <Text style={{ color: Colors.red, fontSize: 13 }}>{fmt(p.totalExpense)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </Card>
            )}

            {/* Recent Transactions */}
            {data.recentTransactions?.length > 0 && (
              <Card style={{ marginTop: 4 }}>
                <Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
                {data.recentTransactions.map((tx) => (
                  <View key={tx.id} style={styles.txRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txName} numberOfLines={1}>{tx.name}</Text>
                      <Text style={styles.txLabel}>{tx.label}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: tx.type === 'Debit' ? Colors.red : Colors.green }]}>
                      {tx.type === 'Debit' ? '-' : '+'}{fmt(tx.amount)}
                    </Text>
                  </View>
                ))}
              </Card>
            )}
          </>
        ) : (
          <Card style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: Colors.gray400 }}>{t('noData')}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 10 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.gray800, marginBottom: 4 },
  grid2: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  profitCard: { alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statLabel: { fontSize: 12, color: Colors.gray500, textAlign: 'center' },
  statValue: { fontSize: 17, fontWeight: '700', marginTop: 2 },
  bigValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  suffix: { fontSize: 14, fontWeight: '600' },
  bigNum: { fontSize: 26, fontWeight: '800' },
  attendanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  attItem: { flex: 1, alignItems: 'center' },
  attLabel: { fontSize: 11, color: Colors.gray500, marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: Colors.gray200 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray700, marginBottom: 10 },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    marginBottom: 6,
  },
  projectName: { fontSize: 14, fontWeight: '600', color: Colors.gray700, flex: 1 },
  projectAmounts: { flexDirection: 'row', alignItems: 'center' },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    marginBottom: 6,
  },
  txName: { fontSize: 13, fontWeight: '600', color: Colors.gray700 },
  txLabel: { fontSize: 11, color: Colors.gray400 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});
