import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { INCLUDED_FEATURE_KEYS, DEFAULT_PLANS } from '../../theme/subscription';
import PlanCard from './PlanCard';
import PaymentResultModal from './PaymentResultModal';
import RazorpayCheckoutModal from './RazorpayCheckoutModal';

export default function PlansGrid() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const {
    plans: contextPlans,
    status,
    refresh,
    createOrder,
    startCheckout,
    paymentsLive: contextPaymentsLive,
    supportPhone: contextSupportPhone,
  } = useSubscription();

  const [plans, setPlans] = useState(contextPlans?.length ? contextPlans : DEFAULT_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [paymentsLive, setPaymentsLive] = useState(contextPaymentsLive !== false);
  const [supportPhone, setSupportPhone] = useState(contextSupportPhone || '6377518112');
  const [busyPlan, setBusyPlan] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeCheckoutOrder, setActiveCheckoutOrder] = useState(null);

  // Auto-trigger celebration modal when plan activates (e.g. after returning from UPI/browser)
  const prevActiveRef = useRef(status?.isActive);
  useEffect(() => {
    if (prevActiveRef.current === false && status?.isActive === true) {
      setSuccess({
        plan: (status?.plans || plans).find((p) => p.code === status?.currentPlanCode) || null,
        expiresAt: status?.expiresAt,
      });
    }
    prevActiveRef.current = status?.isActive;
  }, [status, plans]);

  useEffect(() => {
    if (contextPlans?.length) {
      setPlans(contextPlans);
    }
  }, [contextPlans]);

  useEffect(() => {
    let cancelled = false;
    client
      .get('/subscription/plans')
      .then((res) => {
        if (cancelled) return;
        if (res.data?.plans?.length) {
          setPlans(res.data.plans);
        }
        if (res.data?.paymentsLive !== undefined) setPaymentsLive(res.data.paymentsLive !== false);
        if (res.data?.supportPhone) setSupportPhone(res.data.supportPhone);
      })
      .catch(() => {
        // Fallback to DEFAULT_PLANS gracefully
      })
      .finally(() => {
        if (!cancelled) setLoadingPlans(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = async (plan) => {
    if (busyPlan) return;
    setError(null);
    setBusyPlan(plan.code);

    try {
      // 1. Attempt In-App Razorpay Checkout Order
      const order = await createOrder({ planCode: plan.code, mode: 'checkout' });
      setBusyPlan(null);

      if (order.mode === 'checkout' || order.razorpayOrderId) {
        // Open In-App Razorpay Checkout Modal
        setActiveCheckoutOrder({
          ...order,
          plan,
        });
      } else if (order.paymentUrl) {
        // Fallback to payment link if server specifies link mode
        await Linking.openURL(order.paymentUrl);
        Alert.alert(
          lang === 'hi' ? 'भुगतान शुरू हुआ' : 'Payment Started',
          lang === 'hi'
            ? 'भुगतान पूरा करने के बाद ऐप में वापस आएं, आपका प्लान तुरंत चालू हो जाएगा।'
            : 'Return to the app after completing the payment, your plan will activate immediately.',
          [
            {
              text: lang === 'hi' ? 'स्थिति जांचें' : 'Check Status',
              onPress: async () => {
                const fresh = await refresh();
                if (fresh?.isActive) {
                  setSuccess({
                    plan,
                    expiresAt: fresh.expiresAt,
                  });
                }
              },
            },
            { text: 'OK', style: 'cancel' },
          ]
        );
      }
    } catch (err) {
      setBusyPlan(null);
      const data = err?.response?.data;
      const msg =
        data?.error ||
        err?.message ||
        (lang === 'hi'
          ? 'भुगतान शुरू नहीं हो पाया। कृपया दोबारा कोशिश करें।'
          : 'Could not start payment. Please try again.');
      setError(msg);
      if (data?.supportPhone) setSupportPhone(data.supportPhone);
      if (data?.code === 'PAYMENT_NOT_CONFIGURED') setPaymentsLive(false);
    }
  };

  const handleCheckoutSuccess = (result) => {
    setActiveCheckoutOrder(null);
    setSuccess({
      plan: result.plan,
      expiresAt: result.subscription?.endsAt || result.subscription?.expiresAt,
    });
    refresh();
  };


  if (loadingPlans) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Payments Not Live Notice */}
      {!paymentsLive ? (
        <View style={styles.noticeBox}>
          <Ionicons name="alert-circle" size={20} color="#d97706" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>{t('sub_payments_soon_title')}</Text>
            <Text style={styles.noticeBody}>{t('sub_payments_soon_body')}</Text>
          </View>
        </View>
      ) : null}

      {/* Error Alert */}
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Plan Cards */}
      <View style={styles.cardsWrap}>
        {plans.map((p) => (
          <PlanCard
            key={p.code}
            plan={p}
            lang={lang}
            t={t}
            busy={busyPlan === p.code}
            disabled={Boolean(busyPlan && busyPlan !== p.code)}
            isCurrent={status?.currentPlanCode === p.code && status?.isActive}
            onSelect={handleSelect}
          />
        ))}
      </View>

      {/* Feature Checklist: Everything is included */}
      <View style={styles.featuresCard}>
        <View style={styles.featuresHeader}>
          <Ionicons name="sparkles" size={20} color="#2563eb" />
          <Text style={styles.featuresTitle}>{t('sub_included_title')}</Text>
        </View>
        <Text style={styles.featuresSubtitle}>{t('sub_included_subtitle')}</Text>

        <View style={styles.featureList}>
          {INCLUDED_FEATURE_KEYS.map((key) => (
            <View key={key} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              <Text style={styles.featureText}>{t(key)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Trust Badges Footer */}
      <View style={styles.trustWrap}>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark" size={16} color="#16a34a" />
          <Text style={styles.trustText}>{t('sub_trust_secure')}</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="checkmark-done" size={16} color="#16a34a" />
          <Text style={styles.trustText}>{t('sub_trust_no_autodebit')}</Text>
        </View>
        {supportPhone ? (
          <TouchableOpacity
            style={styles.trustItem}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`tel:${supportPhone}`)}
          >
            <Ionicons name="call" size={15} color="#2563eb" />
            <Text style={[styles.trustText, { color: '#2563eb', fontWeight: '700' }]}>
              {t('sub_trust_help')} {supportPhone}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Razorpay In-App Checkout Modal */}
      <RazorpayCheckoutModal
        visible={Boolean(activeCheckoutOrder)}
        order={activeCheckoutOrder}
        user={user}
        lang={lang}
        onSuccess={handleCheckoutSuccess}
        onError={(err) => setError(err)}
        onClose={() => setActiveCheckoutOrder(null)}
      />

      {/* Success Celebration Modal */}
      <PaymentResultModal
        open={Boolean(success)}
        plan={success?.plan}
        expiresAt={success?.expiresAt}
        onClose={() => setSuccess(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 16,
    padding: 14,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400e',
  },
  noticeBody: {
    fontSize: 12,
    color: '#78350f',
    marginTop: 2,
    lineHeight: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#b91c1c',
    fontWeight: '600',
  },
  cardsWrap: {
    gap: 4,
  },
  featuresCard: {
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
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  featuresSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 18,
  },
  trustWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
});
