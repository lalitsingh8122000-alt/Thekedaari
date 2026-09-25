import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { formatDate } from '../../theme/subscription';

export default function SubscriptionStatusCard() {
  const { t, lang } = useLanguage();
  const { status, refresh, locked } = useSubscription();
  const [refreshing, setRefreshing] = useState(false);

  const planState = status?.status || 'none';
  const isActive = Boolean(status?.isActive);
  const planLabel =
    status?.currentSubscription?.planName ||
    status?.currentPlanCode ||
    (planState === 'legacy'
      ? t('sub_status_founder')
      : planState === 'trial'
      ? t('sub_status_trial')
      : locked
      ? t('sub_status_no_plan')
      : t('sub_status_active'));

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const daysLeft = status?.daysLeft;

  return (
    <View
      style={[
        styles.card,
        isActive ? styles.cardActive : styles.cardExpired,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconAndTitle}>
          <View
            style={[
              styles.iconCircle,
              isActive ? styles.iconActive : styles.iconExpired,
            ]}
          >
            <Ionicons
              name={isActive ? 'ribbon' : 'lock-closed'}
              size={22}
              color={isActive ? '#2563eb' : '#dc2626'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>{t('subscription')}</Text>
            <Text style={styles.planName} numberOfLines={1}>
              {planLabel}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleRefresh}
          disabled={refreshing}
          activeOpacity={0.7}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Ionicons name="refresh" size={18} color="#64748b" />
          )}
        </TouchableOpacity>
      </View>

      {/* Expiry & Days Left */}
      <View style={styles.bottomRow}>
        {status?.expiresAt ? (
          <View style={styles.dateWrap}>
            <Ionicons name="calendar-outline" size={15} color="#64748b" />
            <Text style={styles.dateText}>
              {isActive ? t('sub_valid_until') : t('sub_ended_on')}{' '}
              <Text style={styles.dateBold}>{formatDate(status.expiresAt, lang)}</Text>
            </Text>
          </View>
        ) : (
          <Text style={styles.hintText}>{t('sub_status_no_plan_hint')}</Text>
        )}

        {daysLeft !== null && daysLeft !== undefined && isActive ? (
          <View
            style={[
              styles.daysBadge,
              daysLeft <= 3 ? styles.daysBadgeUrgent : styles.daysBadgeNormal,
            ]}
          >
            <Text
              style={[
                styles.daysText,
                daysLeft <= 3 ? styles.daysTextUrgent : styles.daysTextNormal,
              ]}
            >
              {daysLeft} {t('sub_days_left')}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActive: {
    borderColor: '#bfdbfe',
    backgroundColor: '#f8faff',
  },
  cardExpired: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: '#dbeafe',
  },
  iconExpired: {
    backgroundColor: '#fee2e2',
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 1,
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: '#475569',
  },
  dateBold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
  },
  daysBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  daysBadgeNormal: {
    backgroundColor: '#dbeafe',
  },
  daysBadgeUrgent: {
    backgroundColor: '#fee2e2',
  },
  daysText: {
    fontSize: 12,
    fontWeight: '800',
  },
  daysTextNormal: {
    color: '#1d4ed8',
  },
  daysTextUrgent: {
    color: '#dc2626',
  },
});
