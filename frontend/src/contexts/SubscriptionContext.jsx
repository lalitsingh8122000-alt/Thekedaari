'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionContext = createContext();

const STATUS_CACHE_KEY = 'thekedaar_subscription';

/** Optimistic state from the user object so the first paint is not a spinner. */
function seedFromUser(user) {
  if (!user) return null;
  if (typeof user.subscriptionActive !== 'boolean') return null;
  return {
    enforced: true,
    isActive: user.subscriptionActive,
    status: user.planStatus || (user.subscriptionActive ? 'active' : 'none'),
    expiresAt: user.planExpiresAt || null,
    daysLeft: null,
    isLegacyUser: Boolean(user.isLegacyUser),
    currentPlanCode: user.currentPlanCode || null,
    showRenewalReminder: false,
    plans: [],
  };
}

export function SubscriptionProvider({ children }) {
  const { user, token, loading: authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  // Restore the last known status so a reload does not flash the paywall
  // at a paying user while /subscription/status is still in flight.
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STATUS_CACHE_KEY);
      if (cached) setStatus(JSON.parse(cached));
    } catch {
      /* corrupt cache is not worth handling — it gets overwritten on the next fetch */
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!token) {
      setStatus(null);
      setLoading(false);
      return null;
    }
    const id = ++requestId.current;
    try {
      const res = await api.get('/subscription/status');
      if (id !== requestId.current) return null;
      setStatus(res.data);
      setError(false);
      try {
        localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(res.data));
      } catch {
        /* private mode / quota — the in-memory copy still works */
      }
      return res.data;
    } catch (err) {
      if (id !== requestId.current) return null;
      // 401 is handled globally by the api interceptor (logout + redirect).
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
      try {
        localStorage.removeItem(STATUS_CACHE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    const seed = seedFromUser(user);
    if (seed) setStatus((prev) => prev || seed);
    refresh();
  }, [token, authLoading, user, refresh]);

  // A plan can lapse while the app is open on a site; re-check when it regains focus.
  useEffect(() => {
    if (!token) return undefined;
    const onFocus = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [token, refresh]);

  // Any API call that 402s means access just ended — pull fresh status immediately.
  useEffect(() => {
    const onLocked = () => refresh();
    window.addEventListener('thekedaari:subscription-required', onLocked);
    return () => window.removeEventListener('thekedaari:subscription-required', onLocked);
  }, [refresh]);

  const enforced = status ? status.enforced !== false : true;
  // Unknown status must not lock anyone out — fail open until the server says otherwise.
  const locked = Boolean(token) && enforced && status !== null && status.isActive === false;

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        plans: status?.plans || [],
        loading,
        error,
        locked,
        enforced,
        daysLeft: status?.daysLeft ?? null,
        expiresAt: status?.expiresAt || null,
        isLegacyUser: Boolean(status?.isLegacyUser),
        paymentsLive: status?.paymentsLive !== false,
        showRenewalReminder: Boolean(status?.showRenewalReminder),
        refresh,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext) || {};
