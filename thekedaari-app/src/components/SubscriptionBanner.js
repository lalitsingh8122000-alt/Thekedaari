import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';

const DISMISS_KEY = 'thekedaari_renewal_banner_dismissed';

export default function SubscriptionBanner({ onRenewPress }) {
  const { t } = useLanguage();
  const { showRenewalReminder, daysLeft, isLegacyUser, isTrial } = useSubscription();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    AsyncStorage.getItem(DISMISS_KEY).then((saved) => {
      setDismissed(saved === today);
    });
  }, []);

  if (isTrial || !showRenewalReminder || dismissed) return null;

  const days = daysLeft !== null && daysLeft !== undefined ? daysLeft : 0;
  const isUrgent = days <= 2;

  const handleDismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    AsyncStorage.setItem(DISMISS_KEY, today);
    setDismissed(true);
  };

  const message =
    days <= 0
      ? t('sub_banner_last_day')
      : isLegacyUser
      ? t('sub_banner_founder').replace('{days}', days)
      : t('sub_banner_expiring').replace('{days}', days);

  return (
    <View style={[styles.banner, isUrgent ? styles.urgentBanner : styles.normalBanner]}>
      <Ionicons
        name={isUrgent ? 'alert-circle' : 'time'}
        size={20}
        color={isUrgent ? '#dc2626' : '#d97706'}
        style={{ marginTop: 2 }}
      />
      <Text style={[styles.message, isUrgent ? styles.urgentText : styles.normalText]}>
        {message}
      </Text>

      <TouchableOpacity
        style={[styles.renewBtn, isUrgent ? styles.urgentBtn : styles.normalBtn]}
        activeOpacity={0.8}
        onPress={onRenewPress}
      >
        <Text style={styles.renewText}>{t('sub_renew_now')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDismiss} style={styles.dismissBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={16} color={isUrgent ? '#991b1b' : '#92400e'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  normalBanner: {
    backgroundColor: '#fffbeb',
    borderBottomColor: '#fde68a',
  },
  urgentBanner: {
    backgroundColor: '#fef2f2',
    borderBottomColor: '#fecaca',
  },
  message: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  normalText: {
    color: '#92400e',
  },
  urgentText: {
    color: '#991b1b',
  },
  renewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  normalBtn: {
    backgroundColor: '#d97706',
  },
  urgentBtn: {
    backgroundColor: '#dc2626',
  },
  renewText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  dismissBtn: {
    padding: 4,
  },
});
