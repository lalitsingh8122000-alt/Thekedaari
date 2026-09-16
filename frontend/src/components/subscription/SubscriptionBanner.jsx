'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_PATH } from '@/lib/subscription';

const DISMISS_KEY = 'thekedaari_renewal_banner_dismissed';

/** Renewal nudge in the last few days of a plan. Dismissible once per day. */
export default function SubscriptionBanner() {
  const { t } = useLanguage();
  const { showRenewalReminder, daysLeft, isLegacyUser } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDismissed(localStorage.getItem(DISMISS_KEY) === today);
  }, []);

  if (!showRenewalReminder || dismissed || pathname === SUBSCRIPTION_PATH) return null;

  const urgent = (daysLeft ?? 0) <= 2;
  const days = daysLeft ?? 0;

  const message = isLegacyUser
    ? t('sub_banner_founder').replace('{days}', days)
    : t('sub_banner_expiring').replace('{days}', days);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString().slice(0, 10));
    setDismissed(true);
  };

  return (
    <div
      role="status"
      className={`mb-3 flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${
        urgent ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'
      }`}
    >
      <AlertTriangle
        size={18}
        className={`shrink-0 ${urgent ? 'text-red-500' : 'text-amber-600'}`}
        aria-hidden
      />
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
        {days <= 0 ? t('sub_banner_last_day') : message}
      </p>
      <button
        type="button"
        onClick={() => router.push(SUBSCRIPTION_PATH)}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold text-white transition-transform active:scale-95 ${
          urgent ? 'bg-red-600' : 'bg-amber-600'
        }`}
      >
        {t('sub_renew_now')}
      </button>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100"
        aria-label={t('close')}
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}
