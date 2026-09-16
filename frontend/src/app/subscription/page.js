'use client';

import { HelpCircle } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useLanguage } from '@/contexts/LanguageContext';
import SubscriptionStatusCard from '@/components/subscription/SubscriptionStatusCard';
import PlansGrid from '@/components/subscription/PlansGrid';
import BillingHistory from '@/components/subscription/BillingHistory';

const FAQ_KEYS = [
  ['sub_faq_q1', 'sub_faq_a1'],
  ['sub_faq_q2', 'sub_faq_a2'],
  ['sub_faq_q3', 'sub_faq_a3'],
  ['sub_faq_q4', 'sub_faq_a4'],
];

/** Plan management: current status, price list, billing history, FAQ. */
export default function SubscriptionPage() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="space-y-5">
        <h2 className="page-title">{t('subscription')}</h2>

        <SubscriptionStatusCard />

        <div>
          <h3 className="mb-3 text-base font-bold text-gray-800">{t('sub_pick_plan_heading')}</h3>
          <PlansGrid compact />
        </div>

        <BillingHistory />

        <div className="card space-y-3">
          <h3 className="flex items-center gap-2 font-bold text-gray-800">
            <HelpCircle size={18} className="text-primary-600" aria-hidden />
            {t('sub_faq_title')}
          </h3>
          <dl className="space-y-3">
            {FAQ_KEYS.map(([q, a]) => (
              <div key={q}>
                <dt className="text-sm font-semibold text-gray-800">{t(q)}</dt>
                <dd className="mt-0.5 text-sm leading-snug text-gray-600">{t(a)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </AppShell>
  );
}
