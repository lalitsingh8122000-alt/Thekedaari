import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate, formatRupees } from '../../theme/subscription';

export default function BillingHistory() {
  const { t, lang } = useLanguage();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    client
      .get('/subscription/history')
      .then((res) => {
        if (!cancelled) setHistory(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const orders = history?.orders || [];
  const subscriptions = history?.subscriptions || [];

  // Combine items or display orders
  const items = orders.length ? orders : subscriptions;

  const statusBadge = (status) => {
    switch (status) {
      case 'paid':
        return { label: t('sub_order_status_paid'), bg: '#dcfce7', text: '#15803d' };
      case 'failed':
        return { label: t('sub_order_status_failed'), bg: '#fee2e2', text: '#dc2626' };
      case 'created':
        return { label: t('sub_order_status_created'), bg: '#fef3c7', text: '#b45309' };
      case 'refunded':
        return { label: t('sub_order_status_refunded'), bg: '#f1f5f9', text: '#475569' };
      default:
        return { label: status || '—', bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="receipt-outline" size={20} color="#2563eb" />
        <Text style={styles.title}>{t('sub_history_title')}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t('sub_history_empty')}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item, idx) => {
            const badge = statusBadge(item.status);
            const date = item.paidAt || item.createdAt || item.startsAt;
            return (
              <View
                key={item.id || idx}
                style={[
                  styles.itemRow,
                  idx !== items.length - 1 && styles.itemBorder,
                ]}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.planName}>
                    {lang === 'hi' ? item.planNameHi || item.planName : item.planName}
                  </Text>
                  <Text style={styles.date}>{formatDate(date, lang)}</Text>
                  {item.receipt ? (
                    <Text style={styles.receipt}>#{item.receipt}</Text>
                  ) : null}
                </View>

                <View style={styles.itemRight}>
                  <Text style={styles.amount}>{formatRupees(item.amount)}</Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  loadingWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  list: {
    gap: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemLeft: {
    flex: 1,
  },
  planName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  receipt: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
