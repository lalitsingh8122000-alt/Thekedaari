import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionStatusCard from '../components/subscription/SubscriptionStatusCard';
import PlansGrid from '../components/subscription/PlansGrid';
import BillingHistory from '../components/subscription/BillingHistory';

const FAQ_KEYS = [
  ['sub_faq_q1', 'sub_faq_a1'],
  ['sub_faq_q2', 'sub_faq_a2'],
  ['sub_faq_q3', 'sub_faq_a3'],
  ['sub_faq_q4', 'sub_faq_a4'],
];

export default function SubscriptionScreen({ navigation }) {
  const { t, lang } = useLanguage();
  const { supportPhone } = useSubscription();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (idx) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Screen Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('subscription')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <SubscriptionStatusCard />

        {/* Plans Grid Header */}
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={18} color="#2563eb" />
          <Text style={styles.sectionTitle}>{t('sub_pick_plan_heading')}</Text>
        </View>

        {/* Plans Grid with Checkout */}
        <PlansGrid />

        {/* Billing History */}
        <BillingHistory />

        {/* FAQ Accordion */}
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

        {/* Support Card */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>
            {lang === 'hi'
              ? 'कोई सवाल या ऑनलाइन भुगतान में समस्या?'
              : 'Questions or issues with online payment?'}
          </Text>
          <Text style={styles.supportDesc}>
            {lang === 'hi'
              ? 'हमारी टीम से सीधे बात करें, हम तुरंत मदद करेंगे।'
              : 'Talk directly to our support team, we are here to help.'}
          </Text>
          <View style={styles.supportBtns}>
            <TouchableOpacity
              style={styles.callBtn}
              activeOpacity={0.8}
              onPress={() => Linking.openURL(`tel:${supportPhone || '6377518112'}`)}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.btnText}>
                {lang === 'hi' ? 'कॉल करें' : 'Call'} ({supportPhone || '6377518112'})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.waBtn}
              activeOpacity={0.8}
              onPress={() =>
                Linking.openURL(
                  `https://wa.me/91${supportPhone || '6377518112'}?text=Hello%20Thekedaari%20Support`
                )
              }
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.btnText}>WhatsApp</Text>
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
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gray900,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.gray800,
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
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    gap: 8,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  supportDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  supportBtns: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
  },
  waBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
