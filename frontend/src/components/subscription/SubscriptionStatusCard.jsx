'use client';

import { BadgeCheck, CalendarClock, CircleSlash, Crown, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { formatDate } from '@/lib/subscription';

const THEMES = {
  active: {
    wrap: 'from-emerald-600 to-emerald-700',
    chip: 'bg-white/20 ring-white/25',
    Icon: BadgeCheck,
  },
  legacy: {
    wrap: 'from-indigo-600 to-primary-700',
    chip: 'bg-white/20 ring-white/25',
    Icon: Gift,
  },
  trial: {
    wrap: 'from-sky-600 to-primary-700',
    chip: 'bg-white/20 ring-white/25',
    Icon: Crown,
  },
  inactive: {
    wrap: 'from-slate-700 to-slate-800',
    chip: 'bg-white/15 ring-white/20',
    Icon: CircleSlash,
  },
};

/** Header card on /subscription: what the user has right now, and until when. */
export default function SubscriptionStatusCard() {
  const { t, lang } = useLanguage();
  const { status, loading } = useSubscription();

  if (loading && !status) {
    return <div className="h-36 animate-pulse rounded-3xl bg-gray-200" />;
  }

  const state = status?.status || 'none';
  const isActive = Boolean(status?.isActive);
  const daysLeft = status?.daysLeft ?? 0;

  const themeKey = !isActive ? 'inactive' : state === 'legacy' ? 'legacy' : state === 'trial' ? 'trial' : 'active';
  const theme = THEMES[themeKey];
  const { Icon } = theme;

  let heading = t('sub_status_no_plan');
  if (state === 'legacy') heading = t('sub_status_founder');
  else if (state === 'trial') heading = t('sub_status_trial');
  else if (state === 'grace') heading = t('sub_status_grace');
  else if (isActive) heading = t('sub_status_active');
  else if (state === 'expired') heading = t('sub_status_expired');

  const planLabel =
    status?.currentSubscription?.planName || status?.currentPlanCode || null;

  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.wrap} px-5 py-5 text-white shadow-md sm:px-6`}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${theme.chip}`}
          >
            <Icon size={14} strokeWidth={2.5} aria-hidden />
            {heading}
          </span>

          {planLabel && isActive && (
            <p className="mt-2.5 text-2xl font-extrabold leading-tight">{planLabel}</p>
          )}

          {status?.expiresAt ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
              <CalendarClock size={15} aria-hidden />
              {isActive ? t('sub_valid_until') : t('sub_ended_on')}{' '}
              <span className="font-semibold text-white">{formatDate(status.expiresAt, lang)}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-white/85">{t('sub_status_no_plan_hint')}</p>
          )}
        </div>

        {isActive && (
          <div className="shrink-0 rounded-2xl bg-white/15 px-3.5 py-2.5 text-center ring-1 ring-white/20">
            <p className="text-2xl font-extrabold leading-none tabular-nums">{daysLeft}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/80">
              {t('sub_days_left')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
