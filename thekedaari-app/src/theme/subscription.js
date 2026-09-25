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

export function planDuration(plan, lang = 'en') {
  if (!plan) return '';
  if (plan.months > 0) {
    if (lang === 'hi') return plan.months === 1 ? '1 महीना' : `${plan.months} महीने`;
    return plan.months === 1 ? '1 month' : `${plan.months} months`;
  }
  return lang === 'hi' ? `${plan.durationDays} दिन` : `${plan.durationDays} days`;
}

export const PLAN_THEMES = {
  STARTER_1M: {
    color: '#475569',
    bgColor: '#f8fafc',
    borderColor: '#cbd5e1',
    badgeBg: '#f1f5f9',
    badgeText: '#334155',
    btnBg: '#334155',
    iconBg: '#f1f5f9',
  },
  BUILDER_3M: {
    color: '#059669',
    bgColor: '#f0fdf4',
    borderColor: '#a7f3d0',
    badgeBg: '#dcfce7',
    badgeText: '#15803d',
    btnBg: '#16a34a',
    iconBg: '#dcfce7',
  },
  PRO_6M: {
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    badgeBg: '#dbeafe',
    badgeText: '#1d4ed8',
    btnBg: '#2563eb',
    iconBg: '#dbeafe',
    highlight: true,
  },
  USTAAD_12M: {
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    badgeBg: '#fef3c7',
    badgeText: '#b45309',
    btnBg: '#d97706',
    iconBg: '#fef3c7',
    highlight: true,
  },
};

export function getPlanTheme(plan) {
  if (plan?.code && PLAN_THEMES[plan.code]) {
    return PLAN_THEMES[plan.code];
  }
  if (plan?.months >= 12) return PLAN_THEMES.USTAAD_12M;
  if (plan?.months >= 6) return PLAN_THEMES.PRO_6M;
  if (plan?.months >= 3) return PLAN_THEMES.BUILDER_3M;
  return PLAN_THEMES.STARTER_1M;
}

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

export const DEFAULT_PLANS = [
  {
    code: 'STARTER_1M',
    name: 'Starter',
    nameHi: 'स्टार्टर',
    tagline: 'Try the full app for a month',
    taglineHi: 'पूरा ऐप एक महीने चलाकर देखें',
    months: 1,
    durationDays: 0,
    priceInPaise: 11900,
    price: 119,
    mrpInPaise: 11900,
    mrp: 119,
    perMonth: 119,
    savings: 0,
    savingsPercent: 0,
    badge: null,
    badgeHi: null,
    highlight: false,
    sortOrder: 1,
  },
  {
    code: 'BUILDER_3M',
    name: 'Builder',
    nameHi: 'बिल्डर',
    tagline: 'For a full season of site work',
    taglineHi: 'एक पूरे सीज़न के काम के लिए',
    months: 3,
    durationDays: 0,
    priceInPaise: 29900,
    price: 299,
    mrpInPaise: 35700,
    mrp: 357,
    perMonth: 100,
    savings: 58,
    savingsPercent: 16,
    badge: 'Save 16%',
    badgeHi: '16% बचत',
    highlight: false,
    sortOrder: 2,
  },
  {
    code: 'PRO_6M',
    name: 'Pro Thekedaar',
    nameHi: 'प्रो ठेकेदार',
    tagline: 'Half a year, one payment',
    taglineHi: 'आधा साल, एक ही भुगतान',
    months: 6,
    durationDays: 0,
    priceInPaise: 52900,
    price: 529,
    mrpInPaise: 71400,
    mrp: 714,
    perMonth: 88,
    savings: 185,
    savingsPercent: 26,
    badge: 'Most Popular',
    badgeHi: 'सबसे लोकप्रिय',
    highlight: true,
    sortOrder: 3,
  },
  {
    code: 'USTAAD_12M',
    name: 'Ustaad',
    nameHi: 'उस्ताद',
    tagline: 'Best value — under ₹67 a month',
    taglineHi: 'सबसे किफ़ायती — ₹67/माह से कम',
    months: 12,
    durationDays: 0,
    priceInPaise: 79900,
    price: 799,
    mrpInPaise: 142800,
    mrp: 1428,
    perMonth: 67,
    savings: 629,
    savingsPercent: 44,
    badge: 'Best Value',
    badgeHi: 'सबसे बढ़िया',
    highlight: false,
    sortOrder: 4,
  },
];

