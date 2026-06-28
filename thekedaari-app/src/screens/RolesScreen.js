import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client';
import { Colors } from '../theme/colors';
import { Card, RolesSkeleton, BottomModal, ErrorBox, ConfirmModal } from '../components';
import { useLanguage } from '../context/LanguageContext';

export default function RolesScreen() {
  const { t } = useLanguage();
  const [roles, setRoles] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newTradeName, setNewTradeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDeleteTrade, setPendingDeleteTrade] = useState(null);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [r, t] = await Promise.all([client.get('/roles'), client.get('/contract-trades')]);
      setRoles(r.data);
      setTrades(t.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const addRole = async () => {
    if (saving) return;
    setError('');
    if (!newRoleName.trim()) { setError(t('enterName')); return; }
    setSaving(true);
    try {
      await client.post('/roles', { name: newRoleName.trim() });
      setNewRoleName('');
      setShowRoleModal(false);
      load();
    } catch (err) { setError(err.response?.data?.error || t('addError')); }
    finally { setSaving(false); }
  };

  const addTrade = async () => {
    if (saving) return;
    setError('');
    if (!newTradeName.trim()) { setError(t('enterName')); return; }
    setSaving(true);
    try {
      await client.post('/contract-trades', { name: newTradeName.trim() });
      setNewTradeName('');
      setShowTradeModal(false);
      load();
    } catch (err) { setError(err.response?.data?.error || t('addError')); }
    finally { setSaving(false); }
  };

  const deleteTrade = async () => {
    if (!pendingDeleteTrade) return;
    try {
      await client.delete(`/contract-trades/${pendingDeleteTrade}`);
      setPendingDeleteTrade(null);
      load();
    } catch (err) {
      setPendingDeleteTrade(null);
      Alert.alert(t('deleteFailedTitle'), err.response?.data?.error || t('deleteFailedBody'));
    }
  };

  if (loading) return <RolesSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <FlatList
        data={[]}
        renderItem={null}
        contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />}
        ListHeaderComponent={
          <>
            <Text style={styles.pageTitle}>{t('rolesTitle')}</Text>

            {/* Roles Section */}
            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('roles')}</Text>
                <TouchableOpacity style={styles.addBtnSmall} onPress={() => { setError(''); setNewRoleName(''); setShowRoleModal(true); }}>
                  <Text style={styles.addBtnSmallText}>+ {t('add')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.quickRow}>
                {['Labour', 'Karigar', 'Supervisor', 'Contractor'].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={styles.quickChip}
                    onPress={async () => {
                      try { await client.post('/roles', { name: n }); load(); }
                      catch {}
                    }}
                  >
                    <Text style={styles.quickChipText}>+ {n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {roles.length === 0 ? (
                <Text style={styles.emptyText}>{t('noRoles')}</Text>
              ) : (
                <View style={styles.tagGrid}>
                  {roles.map((r) => (
                    <View key={r.id} style={styles.roleTag}>
                      <Text style={styles.roleTagText}>{r.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            {/* Contract Trades Section */}
            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('contractTypes')}</Text>
                <TouchableOpacity style={[styles.addBtnSmall, { backgroundColor: Colors.amber }]} onPress={() => { setError(''); setNewTradeName(''); setShowTradeModal(true); }}>
                  <Text style={styles.addBtnSmallText}>+ {t('add')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hintText}>{t('contractTypesHint')}</Text>
              <View style={styles.quickRow}>
                {['Colour', 'Marble', 'Plumbing', 'Electric', 'Carpentry'].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.quickChip, { borderColor: Colors.amber }]}
                    onPress={async () => {
                      try { await client.post('/contract-trades', { name: n }); load(); }
                      catch {}
                    }}
                  >
                    <Text style={[styles.quickChipText, { color: Colors.amber }]}>+ {n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {trades.length === 0 ? (
                <Text style={styles.emptyText}>{t('noContractTypes')}</Text>
              ) : (
                <View style={styles.tagGrid}>
                  {trades.map((t) => (
                    <View key={t.id} style={styles.tradeTagRow}>
                      <View style={[styles.roleTag, { backgroundColor: Colors.amberLight }]}>
                        <Text style={[styles.roleTagText, { color: '#92400e' }]}>{t.name}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setPendingDeleteTrade(t.id)} style={styles.deleteTradeBtn}>
                        <Text style={{ fontSize: 12, color: Colors.red }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </>
        }
      />

      <BottomModal visible={showRoleModal} onClose={() => setShowRoleModal(false)} title={t('addRole')}>
        <ErrorBox message={error} />
        <TextInput
          style={styles.input}
          value={newRoleName}
          onChangeText={setNewRoleName}
          placeholder={t('roleNamePlaceholder')}
          placeholderTextColor={Colors.gray400}
          autoFocus
        />
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={addRole}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? t('adding') : t('add')}</Text>
        </TouchableOpacity>
      </BottomModal>

      <BottomModal visible={showTradeModal} onClose={() => setShowTradeModal(false)} title={t('addContractType')}>
        <ErrorBox message={error} />
        <TextInput
          style={styles.input}
          value={newTradeName}
          onChangeText={setNewTradeName}
          placeholder={t('tradeNamePlaceholder')}
          placeholderTextColor={Colors.gray400}
          autoFocus
        />
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.amber }, saving && { opacity: 0.6 }]}
          onPress={addTrade}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? t('adding') : t('add')}</Text>
        </TouchableOpacity>
      </BottomModal>

      <ConfirmModal
        visible={!!pendingDeleteTrade}
        title={t('deleteContractTypeTitle')}
        body={t('deleteContractTypeBody')}
        onConfirm={deleteTrade}
        onCancel={() => setPendingDeleteTrade(null)}
        confirmText={t('delete')}
        cancelText={t('cancel')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray800, marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray700 },
  addBtnSmall: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnSmallText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  hintText: { fontSize: 12, color: Colors.gray500, marginBottom: 8 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  quickChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.blueBg,
  },
  quickChipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleTag: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  roleTagText: { fontSize: 13, fontWeight: '600', color: Colors.primaryDark },
  tradeTagRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deleteTradeBtn: { padding: 4 },
  emptyText: { fontSize: 13, color: Colors.gray400, textAlign: 'center', paddingVertical: 8 },
  input: {
    borderWidth: 2, borderColor: Colors.gray200, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: Colors.gray800,
    backgroundColor: Colors.white, marginBottom: 12,
  },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
