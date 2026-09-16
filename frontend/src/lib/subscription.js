/** Shared formatting + presentation helpers for the subscription screens. */

export const SUBSCRIPTION_PATH = '/subscription';

/** Pages that stay reachable when a plan has lapsed — buying, support, and account pages. */
export const UNLOCKED_PATHS = [
  '/subscription',
  '/profile',
  '/contact-us',
  '/how-to-use',
  '/about-us',
  '/privacy-policy',
  '/delete-account',
  '/blogs',
];

export function isUnlockedPath(pathname = '') {
  return UNLOCKED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** ₹1,234 — no decimals, Indian grouping. */
export function formatRupees(value) {
  const num = Number(value || 0);
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatDate(value, lang = 'en') {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function planName(plan, lang = 'en') {
  if (!plan) return '';
  return lang === 'hi' ? plan.nameHi || plan.name : plan.name;
}

export function planTagline(plan, lang = 'en') {
  if (!plan) return '';
  return (lang === 'hi' ? plan.taglineHi || plan.tagline : plan.tagline) || '';
}

export function planBadge(plan, lang = 'en') {
  if (!plan) return '';
  return (lang === 'hi' ? plan.badgeHi || plan.badge : plan.badge) || '';
}

/** "3 months" / "3 महीने" for a plan's billing length. */
export function planDuration(plan, lang = 'en') {
  if (!plan) return '';
  if (plan.months > 0) {
    if (lang === 'hi') return plan.months === 1 ? '1 महीना' : `${plan.months} महीने`;
    return plan.months === 1 ? '1 month' : `${plan.months} months`;
  }
  return lang === 'hi' ? `${plan.durationDays} दिन` : `${plan.durationDays} days`;
}

/**
 * Per-plan accent colours. Keyed by plan code with a duration-based fallback so a
 * newly added plan still renders sensibly.
 */
const ACCENTS = {
  slate: {
    ring: 'border-slate-200',
    chip: 'bg-slate-100 text-slate-700',
    price: 'text-slate-900',
    button: 'bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white',
    glow: 'from-slate-500/10',
    icon: 'text-slate-600 bg-slate-100',
  },
  emerald: {
    ring: 'border-emerald-200',
    chip: 'bg-emerald-100 text-emerald-700',
    price: 'text-emerald-700',
    button: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
    glow: 'from-emerald-500/10',
    icon: 'text-emerald-600 bg-emerald-100',
  },
  primary: {
    ring: 'border-primary-300',
    chip: 'bg-primary-100 text-primary-700',
    price: 'text-primary-700',
    button: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white',
    glow: 'from-primary-500/15',
    icon: 'text-primary-600 bg-primary-100',
  },
  amber: {
    ring: 'border-amber-300',
    chip: 'bg-amber-100 text-amber-800',
    price: 'text-amber-700',
    button: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white',
    glow: 'from-amber-500/15',
    icon: 'text-amber-700 bg-amber-100',
  },
};

const CODE_ACCENTS = {
  STARTER_1M: 'slate',
  BUILDER_3M: 'emerald',
  PRO_6M: 'primary',
  USTAAD_12M: 'amber',
};

export function planAccent(plan) {
  const key = CODE_ACCENTS[plan?.code];
  if (key) return ACCENTS[key];
  if (plan?.months >= 12) return ACCENTS.amber;
  if (plan?.months >= 6) return ACCENTS.primary;
  if (plan?.months >= 3) return ACCENTS.emerald;
  return ACCENTS.slate;
}

/** Feature keys listed under the plans — every plan unlocks all of them. */
export const INCLUDED_FEATURE_KEYS = [
  'sub_feature_projects',
  'sub_feature_attendance',
  'sub_feature_ledger',
  'sub_feature_finance',
  'sub_feature_vendors',
  'sub_feature_reports',
  'sub_feature_languages',
  'sub_feature_support',
];
