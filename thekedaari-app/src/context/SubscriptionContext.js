import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { setSubscriptionRequiredCallback } from '../api/client';
import { useAuth } from './AuthContext';
import { DEFAULT_PLANS } from '../theme/subscription';

const SubscriptionContext = createContext(null);
const STATUS_CACHE_KEY = 'thekedaar_subscription';

function seedFromUser(user) {
  if (!user) return null;
  const isExplicitlyActive = user.subscriptionActive === true;
  return {
    enforced: true,
    isActive: isExplicitlyActive,
    status: user.planStatus || (isExplicitlyActive ? 'active' : 'none'),
    expiresAt: user.planExpiresAt || null,
    daysLeft: null,
    isLegacyUser: Boolean(user.isLegacyUser),
    currentPlanCode: user.currentPlanCode || null,
    showRenewalReminder: false,
    plans: DEFAULT_PLANS,
  };
}

export function SubscriptionProvider({ children }) {
  const { user, token, loading: authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  // Restore cached status
  useEffect(() => {
    AsyncStorage.getItem(STATUS_CACHE_KEY)
      .then((cached) => {
        if (cached) {
          try {
            setStatus(JSON.parse(cached));
          } catch {
            /* ignore JSON parse error */
          }
        }
      })
      .catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    if (!token) {
      setStatus(null);
      setLoading(false);
      return null;
    }
    const id = ++requestId.current;
    try {
      const res = await client.get('/subscription/status');
      if (id !== requestId.current) return null;
      const data = res.data;
      if (!data.plans || data.plans.length === 0) {
        data.plans = DEFAULT_PLANS;
      }
      setStatus(data);
      setError(false);
      await AsyncStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      if (id !== requestId.current) return null;
      if (err?.response?.status !== 401) setError(true);
      return null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setStatus(null);
      setLoading(false);
      AsyncStorage.removeItem(STATUS_CACHE_KEY).catch(() => {});
      return;
    }
    const seed = seedFromUser(user);
    if (seed) setStatus((prev) => prev || seed);
    refresh();
  }, [token, authLoading, user, refresh]);

  const [paymentEvent, setPaymentEvent] = useState(null);
  const clearPaymentEvent = useCallback(() => setPaymentEvent(null), []);

  // When app comes back to foreground (e.g. after completing payment in UPI app)
  useEffect(() => {
    if (!token) return;
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refresh();
      }
    });

    const handleUrl = (event) => {
      const url = typeof event === 'string' ? event : event?.url;
      if (!url) return;
      if (url.includes('subscription') || url.includes('payment')) {
        let outcome = null;
        let planCode = null;
        const outcomeMatch = url.match(/[?&]payment=([^&]+)/);
        const planMatch = url.match(/[?&]plan=([^&]+)/);
        if (outcomeMatch) outcome = decodeURIComponent(outcomeMatch[1]);
        if (planMatch) planCode = decodeURIComponent(planMatch[1]);

        if (outcome) {
          setPaymentEvent({ outcome, planCode, timestamp: Date.now() });
        }
        refresh();
      }
    };

    // Handle deep links (e.g. thekedaari://subscription?payment=success)
    const urlSub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then(handleUrl);

    return () => {
      subscription.remove();
      urlSub.remove();
    };
  }, [token, refresh]);

  // Listen for 402 subscription-required callback from client.js
  useEffect(() => {
    setSubscriptionRequiredCallback((detail) => {
      setStatus((prev) => ({
        ...(prev || {}),
        ...(detail || {}),
        isActive: false,
        status: detail?.status || 'expired',
      }));
      refresh();
    });
  }, [refresh]);

  /**
   * Create an Order for Razorpay payment link or checkout
   */
  const createOrder = useCallback(
    async ({ planCode, mode = 'link' }) => {
      const res = await client.post('/subscription/orders', { planCode, mode });
      return res.data;
    },
    []
  );

  /**
   * Verify Razorpay Payment Signature
   */
  const verifyPayment = useCallback(
    async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
      const res = await client.post('/subscription/verify', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      const data = res.data;
      if (data?.success && data?.subscription) {
        const updatedStatus = {
          ...(status || {}),
          isActive: true,
          status: 'active',
          expiresAt: data.subscription.endsAt || data.subscription.expiresAt,
          currentPlanCode: data.subscription.planCode,
          daysLeft: data.daysLeft || 30,
        };
        setStatus(updatedStatus);
        AsyncStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(updatedStatus)).catch(() => {});
      }
      refresh();
      return data;
    },
    [status, refresh]
  );

  /**
   * Start payment via link or checkout order
   */
  const startCheckout = useCallback(
    async ({ planCode, lang = 'hi', openExternal = false, onError }) => {
      try {
        const res = await client.post('/subscription/orders', { planCode, mode: 'link' });
        const order = res.data;

        if (openExternal && order.paymentUrl) {
          try {
            await Linking.openURL(order.paymentUrl);
            return { order, opened: true };
          } catch (openErr) {
            console.error('[Subscription] Failed to open payment URL:', openErr);
            throw new Error(
              lang === 'hi'
                ? 'भुगतान पेज नहीं खुल पाया। कृपया दोबारा कोशिश करें।'
                : 'Could not open payment page. Please try again.'
            );
          }
        }
        return { order, opened: false };
      } catch (err) {
        const data = err?.response?.data;
        const msg =
          data?.error ||
          err?.message ||
          (lang === 'hi'
            ? 'भुगतान शुरू नहीं हो पाया। दोबारा कोशिश करें।'
            : 'Could not start payment. Please try again.');
        if (onError) onError(msg, data);
        throw err;
      }
    },
    []
  );

  const enforced = status ? status.enforced !== false : true;

  // Strict paywall rule: A logged-in user MUST be locked if subscription is enforced
  // and status is not active. This ensures brand new signups land on the paywall screen.
  const locked = Boolean(token) && enforced && status?.isActive !== true;

  const currentPlans = status?.plans && status.plans.length > 0 ? status.plans : DEFAULT_PLANS;

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        plans: currentPlans,
        loading,
        error,
        locked,
        enforced,
        daysLeft: status?.daysLeft ?? null,
        expiresAt: status?.expiresAt || null,
        isLegacyUser: Boolean(status?.isLegacyUser),
        paymentsLive: status?.paymentsLive !== false,
        showRenewalReminder: Boolean(status?.showRenewalReminder),
        currentSubscription: status?.currentSubscription || null,
        currentPlanCode: status?.currentPlanCode || status?.currentSubscription?.planCode || null,
        supportPhone: status?.supportPhone || '6377518112',
        paymentEvent,
        clearPaymentEvent,
        refresh,
        createOrder,
        verifyPayment,
        startCheckout,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext) || {};

