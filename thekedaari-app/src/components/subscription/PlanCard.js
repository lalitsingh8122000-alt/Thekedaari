import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import {
  formatRupees,
  planName,
  planTagline,
  planBadge,
  planDuration,
  getPlanTheme,
} from '../../theme/subscription';

export default function PlanCard({
  plan,
  lang = 'en',
  t,
  onSelect,
  busy = false,
  disabled = false,
  isCurrent = false,
}) {
  const theme = getPlanTheme(plan);
  const badge = planBadge(plan, lang);
  const name = planName(plan, lang);
  const duration = planDuration(plan, lang);
  const tagline = planTagline(plan, lang);
  const hi = lang === 'hi';

  const planIcons = {
    STARTER_1M: 'shield-outline',
    BUILDER_3M: 'hammer-outline',
    PRO_6M: 'ribbon-outline',
    USTAAD_12M: 'trophy-outline',
  };

  const iconName = planIcons[plan.code] || 'star-outline';

  return (
    <View
      style={[
        styles.card,
        { borderColor: theme.borderColor },
        plan.highlight && styles.highlightCard,
      ]}
    >
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
          <Text style={[styles.badgeText, { color: theme.badgeText }]}>{badge}</Text>
        </View>
      ) : null}

      {/* Header with Icon and Title */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
          <Ionicons name={iconName} size={22} color={theme.color} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.duration}>{duration}</Text>
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: theme.color }]}>{formatRupees(plan.price)}</Text>
        {plan.mrp > plan.price ? (
          <Text style={styles.mrp}>{formatRupees(plan.mrp)}</Text>
        ) : null}
      </View>

      {/* Per Month Breakdown & Savings */}
      <View style={styles.breakdownRow}>
        <Text style={styles.perMonth}>
          {formatRupees(plan.perMonth)}
          <Text style={styles.perMonthSub}> / {hi ? 'महीना' : 'month'}</Text>
        </Text>
        {plan.savingsPercent > 0 ? (
          <View style={styles.savingsTag}>
            <Text style={styles.savingsText}>
              {hi ? `${formatRupees(plan.savings)} बचाएँ` : `Save ${formatRupees(plan.savings)}`}
            </Text>
          </View>
        ) : null}
      </View>

      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}

      {/* Button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.btnBg },
          (busy || disabled) && styles.buttonDisabled,
        ]}
        activeOpacity={0.85}
        onPress={() => onSelect(plan)}
        disabled={busy || disabled}
      >
        {busy ? (
          <View style={styles.btnContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonText}>{t('sub_opening_payment')}</Text>
          </View>
        ) : isCurrent ? (
          <View style={styles.btnContent}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>{t('sub_extend_plan')}</Text>
          </View>
        ) : (
          <View style={styles.btnContent}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>{t('sub_choose_plan')}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  highlightCard: {
    borderWidth: 2,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -11,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  duration: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  mrp: {
    fontSize: 15,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    paddingBottom: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  perMonth: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  perMonthSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
  savingsTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },
  tagline: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 16,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
