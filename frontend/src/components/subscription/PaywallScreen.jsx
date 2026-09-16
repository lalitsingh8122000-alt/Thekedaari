'use client';

import Image from 'next/image';
import { Lock, DatabaseBackup, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { formatDate } from '@/lib/subscription';
import PlansGrid from './PlansGrid';

/**
 * Full-page price list shown in place of the app when a plan has lapsed.
 * The headline changes with how the user got here — a founder member whose free
 * window closed should not read the same line as someone who never had access.
 */
export default function PaywallScreen() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { status, expiresAt } = useSubscription();

  const state = status?.status || 'none';
  const isFounder = Boolean(status?.isLegacyUser);

  let title = t('paywall_title_choose');
  let subtitle = t('paywall_sub_choose');

  if (isFounder && (state === 'expired' || state === 'grace')) {
    title = t('paywall_title_founder_ended');
    subtitle = t('paywall_sub_founder_ended');
  } else if (state === 'expired' || state === 'grace') {
    title = t('paywall_title_expired');
    subtitle = t('paywall_sub_expired');
  }

  const firstName = user?.name?.trim()?.split(' ')[0] || '';

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-5 py-7 text-white shadow-lg sm:px-8 sm:py-9">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-white/5 blur-2xl"
          aria-hidden
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Lock size={24} strokeWidth={2.25} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary-100">
                {firstName ? t('paywall_greeting').replace('{name}', firstName) : t('app_name')}
              </p>
              <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">{title}</h1>
            </div>
          </div>

          <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-primary-50">{subtitle}</p>

          {expiresAt && (state === 'expired' || state === 'grace') && (
            <p className="mt-2 text-sm text-primary-100">
              {t('sub_ended_on')} <span className="font-semibold text-white">{formatDate(expiresAt, lang)}</span>
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
              <DatabaseBackup size={14} aria-hidden />
              {t('paywall_data_safe')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
              <Sparkles size={14} aria-hidden />
              {t('paywall_instant_unlock')}
            </span>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Image src="/thekedaari-logo.png" alt="" width={22} height={22} className="rounded" />
        <span>{t('sub_pick_plan_heading')}</span>
      </div>

      <PlansGrid />
    </div>
  );
}
