'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Loader2, Phone, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { startCheckout } from '@/lib/razorpay';
import { INCLUDED_FEATURE_KEYS } from '@/lib/subscription';
import PlanCard from './PlanCard';
import PaymentResultModal from './PaymentResultModal';

/**
 * Price list + the whole buy flow. Shared by the lapsed-plan paywall and the
 * /subscription page so pricing only ever renders one way.
 */
export default function PlansGrid({ compact = false }) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { plans: contextPlans, status, refresh } = useSubscription();

  const [plans, setPlans] = useState(contextPlans || []);
  const [loadingPlans, setLoadingPlans] = useState(!contextPlans?.length);
  const [paymentsLive, setPaymentsLive] = useState(true);
  const [supportPhone, setSupportPhone] = useState(null);
  const [busyPlan, setBusyPlan] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  // Coming back from a Razorpay-hosted payment page: the server has already verified
  // the signature and credited the plan, so just re-read status and report the outcome.
  //
  // Read the query string straight off window rather than useSearchParams(): this
  // component also renders inside the paywall on every gated page, and useSearchParams
  // would force each of them behind a Suspense boundary.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get('payment');
    if (!outcome) return;

    let pending = null;
    try {
      const raw = sessionStorage.getItem('thekedaari_pending_payment');
      if (raw) pending = JSON.parse(raw);
      sessionStorage.removeItem('thekedaari_pending_payment');
    } catch {
      /* nothing to recover — the server is the source of truth either way */
    }

    if (outcome === 'success') {
      refresh?.().then((fresh) => {
        const code = params.get('plan') || pending?.planCode;
        setSuccess({
          plan: (fresh?.plans || []).find((p) => p.code === code) || null,
          expiresAt: fresh?.expiresAt || null,
        });
      });
    } else if (outcome === 'cancelled') {
      setError(t('sub_payment_cancelled'));
    } else {
      setError(t('sub_payment_failed'));
    }

    // Drop the query string so a refresh does not replay the message.
    router.replace('/subscription', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contextPlans?.length) {
      setPlans(contextPlans);
      setLoadingPlans(false);
    }
    if (status?.paymentsLive !== undefined) setPaymentsLive(status.paymentsLive !== false);
    if (status?.supportPhone) setSupportPhone(status.supportPhone);
  }, [contextPlans, status]);

  useEffect(() => {
    if (contextPlans?.length) return undefined;
    let cancelled = false;
    api
      .get('/subscription/plans')
      .then((res) => {
        if (cancelled) return;
        setPlans(res.data.plans || []);
        setPaymentsLive(res.data.paymentsLive !== false);
        setSupportPhone(res.data.supportPhone || null);
      })
      .catch(() => {
        if (!cancelled) setError(t('sub_plans_load_failed'));
      })
      .finally(() => {
        if (!cancelled) setLoadingPlans(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contextPlans, t]);

  const handleSelect = useCallback(
    async (plan) => {
      if (busyPlan) return;
      setError(null);
      setBusyPlan(plan.code);
      await startCheckout({
        planCode: plan.code,
        user,
        lang,
        onSuccess: async (result) => {
          setBusyPlan(null);
          const fresh = await refresh?.();
          setSuccess({
            plan: result.plan || plan,
            expiresAt: fresh?.expiresAt || result.subscription?.expiresAt || null,
          });
        },
        onError: (message, meta) => {
          setBusyPlan(null);
          setError(message);
          if (meta?.supportPhone) setSupportPhone(meta.supportPhone);
          if (meta?.code === 'PAYMENT_NOT_CONFIGURED') setPaymentsLive(false);
        },
        onDismiss: () => setBusyPlan(null),
      });
    },
    [busyPlan, lang, refresh, user]
  );

  if (loadingPlans) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!paymentsLive && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="font-semibold">{t('sub_payments_soon_title')}</p>
            <p className="mt-0.5 leading-snug">{t('sub_payments_soon_body')}</p>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-800"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" aria-hidden />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      <div className={`grid gap-3.5 sm:gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.code}
            plan={plan}
            lang={lang}
            t={t}
            busy={busyPlan === plan.code}
            disabled={Boolean(busyPlan) && busyPlan !== plan.code}
            isCurrent={status?.currentPlanCode === plan.code && status?.isActive}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-base font-bold text-gray-900">{t('sub_included_title')}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{t('sub_included_subtitle')}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {INCLUDED_FEATURE_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm text-gray-700">
              <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" strokeWidth={2.75} aria-hidden />
              <span className="leading-snug">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={15} className="text-emerald-600" aria-hidden />
          {t('sub_trust_secure')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Check size={15} className="text-emerald-600" aria-hidden />
          {t('sub_trust_no_autodebit')}
        </span>
        {supportPhone && (
          <a
            href={`tel:${supportPhone}`}
            className="inline-flex items-center gap-1.5 font-semibold text-primary-700 hover:underline"
          >
            <Phone size={15} aria-hidden />
            {t('sub_trust_help')} {supportPhone}
          </a>
        )}
      </div>

      <PaymentResultModal
        open={Boolean(success)}
        plan={success?.plan}
        expiresAt={success?.expiresAt}
        onClose={() => setSuccess(null)}
      />
    </div>
  );
}
