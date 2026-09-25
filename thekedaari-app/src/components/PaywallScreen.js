import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { formatDate } from '../theme/subscription';
import PlansGrid from './subscription/PlansGrid';

const FAQ_KEYS = [
  ['sub_faq_q1', 'sub_faq_a1'],
  ['sub_faq_q2', 'sub_faq_a2'],
  ['sub_faq_q3', 'sub_faq_a3'],
  ['sub_faq_q4', 'sub_faq_a4'],
];

export default function PaywallScreen() {
  const { user, logout } = useAuth();
  const { t, lang, switchLang } = useLanguage();
  const { status, expiresAt, supportPhone, refresh } = useSubscription();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const planState = status?.status || 'none';
  const isLegacy = Boolean(status?.isLegacyUser);
  const isExpired = planState === 'expired' || planState === 'grace';

  let title = t('paywall_title_choose');
  let subtitle = t('paywall_sub_choose');

  if (isLegacy && isExpired) {
    title = t('paywall_title_founder_ended');
    subtitle = t('paywall_sub_founder_ended');
  } else if (isExpired) {
    title = t('paywall_title_expired');
    subtitle = t('paywall_sub_expired');
  }

  const firstName = user?.name ? user.name.trim().split(' ')[0] : '';
  const greeting = firstName
    ? t('paywall_greeting').replace('{name}', firstName)
    : t('appName');

  const handleLogout = () => {
    Alert.alert(t('logoutTitle'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logoutBtn'), style: 'destructive', onPress: logout },
    ]);
  };

  const toggleFaq = (idx) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Control Bar */}
        <View style={styles.topControlBar}>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => switchLang(lang === 'hi' ? 'en' : 'hi')}
          >
            <Ionicons name="globe-outline" size={15} color="#2563eb" />
            <Text style={styles.langBtnText}>{lang === 'hi' ? 'English' : 'हिंदी'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color="#dc2626" />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Header Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="lock-closed" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroGreeting}>{greeting}</Text>
              <Text style={styles.heroTitle}>{title}</Text>
            </View>
          </View>

          <Text style={styles.heroSub}>{subtitle}</Text>

          {expiresAt && isExpired ? (
            <View style={styles.endedDateRow}>
              <Ionicons name="calendar-outline" size={15} color="#bfdbfe" />
              <Text style={styles.endedDateText}>
                {t('sub_ended_on')}:{' '}
                <Text style={{ fontWeight: '800', color: '#fff' }}>
                  {formatDate(expiresAt, lang)}
                </Text>
              </Text>
            </View>
          ) : null}

          {/* Value Pills */}
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <Ionicons name="shield-checkmark" size={14} color="#86efac" />
              <Text style={styles.pillText}>{t('paywall_data_safe')}</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="flash" size={14} color="#fde047" />
              <Text style={styles.pillText}>{t('paywall_instant_unlock')}</Text>
            </View>
          </View>
        </View>

        {/* Pick Plan Section Title */}
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={18} color="#2563eb" />
          <Text style={styles.sectionTitle}>{t('sub_pick_plan_heading')}</Text>
        </View>

        {/* Plans Grid with Buy Buttons */}
        <PlansGrid />

        {/* FAQs Section */}
        <View style={styles.faqCard}>
          <View style={styles.faqHeader}>
            <Ionicons name="help-circle-outline" size={20} color="#2563eb" />
            <Text style={styles.faqTitle}>{t('sub_faq_title')}</Text>
          </View>

          <View style={styles.faqList}>
            {FAQ_KEYS.map(([qKey, aKey], idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <TouchableOpacity
                  key={qKey}
                  style={styles.faqItem}
                  activeOpacity={0.8}
                  onPress={() => toggleFaq(idx)}
                >
                  <View style={styles.faqQuestionRow}>
                    <Text style={styles.faqQuestion}>{t(qKey)}</Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748b"
                    />
                  </View>
                  {isOpen ? (
                    <Text style={styles.faqAnswer}>{t(aKey)}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Need Help Footer */}
        <View style={styles.helpFooter}>
          <Text style={styles.helpText}>
            {lang === 'hi'
              ? 'कोई परेशानी? सीधे हमारे सपोर्ट से संपर्क करें'
              : 'Need help? Contact our direct support'}
          </Text>
          <View style={styles.helpButtonsRow}>
            <TouchableOpacity
              style={styles.callSupportBtn}
              activeOpacity={0.8}
              onPress={() => Linking.openURL(`tel:${supportPhone || '6377518112'}`)}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.callSupportText}>
                {lang === 'hi' ? 'कॉल करें' : 'Call Support'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappSupportBtn}
              activeOpacity={0.8}
              onPress={() =>
                Linking.openURL(
                  `https://wa.me/91${supportPhone || '6377518112'}?text=Hello%20Thekedaari%20Support`
                )
              }
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.whatsappSupportText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  topControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
  },
  heroCard: {
    backgroundColor: '#1d4ed8',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGreeting: {
    fontSize: 13,
    fontWeight: '600',
    color: '#bfdbfe',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#fff',
    marginTop: 2,
    lineHeight: 24,
  },
  heroSub: {
    fontSize: 13,
    color: '#dbeafe',
    marginTop: 10,
    lineHeight: 18,
  },
  endedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  endedDateText: {
    fontSize: 12,
    color: '#bfdbfe',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  faqAnswer: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 18,
  },
  helpFooter: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  helpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  helpButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  callSupportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
  },
  callSupportText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  whatsappSupportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
  },
  whatsappSupportText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
