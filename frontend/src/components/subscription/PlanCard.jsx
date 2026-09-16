'use client';

import { Zap, TrendingUp, Crown, Gem, Check, Loader2 } from 'lucide-react';
import {
  formatRupees,
  planAccent,
  planBadge,
  planDuration,
  planName,
  planTagline,
} from '@/lib/subscription';

const ICONS = {
  STARTER_1M: Zap,
  BUILDER_3M: TrendingUp,
  PRO_6M: Crown,
  USTAAD_12M: Gem,
};

function iconFor(plan) {
  if (ICONS[plan.code]) return ICONS[plan.code];
  if (plan.months >= 12) return Gem;
  if (plan.months >= 6) return Crown;
  if (plan.months >= 3) return TrendingUp;
  return Zap;
}

export default function PlanCard({ plan, lang, t, onSelect, busy = false, disabled = false, isCurrent = false }) {
  const accent = planAccent(plan);
  const Icon = iconFor(plan);
  const badge = planBadge(plan, lang);
  const hi = lang === 'hi';

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-4 sm:p-5 transition-shadow ${
        plan.highlight
          ? `${accent.ring} border-2 shadow-lg shadow-primary-500/10`
          : `${accent.ring} shadow-sm hover:shadow-md`
      }`}
    >
      {plan.highlight && (
        <div
          className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b ${accent.glow} to-transparent`}
          aria-hidden
        />
      )}

      {badge && (
        <span
          className={`absolute -top-2.5 right-4 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm ${accent.chip}`}
        >
          {badge}
        </span>
      )}

      <div className="relative flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}>
          <Icon size={22} strokeWidth={2.25} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-gray-900">{planName(plan, lang)}</h3>
          <p className="text-sm font-medium text-gray-500">{planDuration(plan, lang)}</p>
        </div>
      </div>

      <div className="relative mt-4 flex items-end gap-2">
        <span className={`text-4xl font-extrabold leading-none tracking-tight ${accent.price}`}>
          {formatRupees(plan.price)}
        </span>
        {plan.mrp > plan.price && (
          <span className="pb-1 text-base font-medium text-gray-400 line-through">
            {formatRupees(plan.mrp)}
          </span>
        )}
      </div>

      <p className="relative mt-1.5 text-sm text-gray-600">
        {formatRupees(plan.perMonth)}
        <span className="text-gray-400"> / {hi ? 'महीना' : 'month'}</span>
        {plan.savingsPercent > 0 && (
          <span className="ml-2 font-semibold text-emerald-600">
            {hi ? `${formatRupees(plan.savings)} बचाएँ` : `save ${formatRupees(plan.savings)}`}
          </span>
        )}
      </p>

      {planTagline(plan, lang) && (
        <p className="relative mt-3 text-sm leading-snug text-gray-500">{planTagline(plan, lang)}</p>
      )}

      <button
        type="button"
        onClick={() => onSelect(plan)}
        disabled={busy || disabled}
        className={`relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${accent.button}`}
      >
        {busy ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden />
            {t('sub_redirecting')}
          </>
        ) : isCurrent ? (
          <>
            <Check size={18} strokeWidth={2.5} aria-hidden />
            {t('sub_extend_plan')}
          </>
        ) : (
          t('sub_choose_plan')
        )}
      </button>
    </div>
  );
}
