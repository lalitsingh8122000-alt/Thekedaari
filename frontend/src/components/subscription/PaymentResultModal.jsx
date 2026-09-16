'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, CalendarCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, planName } from '@/lib/subscription';

/** Shown after the server confirms a payment. */
export default function PaymentResultModal({ open, plan, expiresAt, onClose }) {
  const { t, lang } = useLanguage();
  const router = useRouter();

  if (!open) return null;

  const goToApp = () => {
    onClose?.();
    router.push('/dashboard');
  };

  return (
    <div className="modal-overlay z-[70] p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl motion-safe:animate-auth-enter">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pb-6 pt-7 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/25">
            <CheckCircle2 size={38} className="text-white" strokeWidth={2.25} aria-hidden />
          </div>
          <h2 className="text-xl font-extrabold text-white">{t('sub_success_title')}</h2>
          <p className="mt-1 text-sm text-emerald-50">
            {plan ? t('sub_success_plan_active').replace('{plan}', planName(plan, lang)) : t('sub_success_generic')}
          </p>
        </div>

        <div className="space-y-4 p-5">
          {expiresAt && (
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <CalendarCheck size={20} className="shrink-0 text-primary-600" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{t('sub_valid_until')}</p>
                <p className="truncate font-bold text-gray-900">{formatDate(expiresAt, lang)}</p>
              </div>
            </div>
          )}

          <p className="text-center text-sm leading-snug text-gray-600">{t('sub_success_receipt_note')}</p>

          <button type="button" onClick={goToApp} className="auth-submit">
            {t('sub_success_cta')}
            <ArrowRight size={20} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
