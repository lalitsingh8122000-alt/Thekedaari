/**
 * Central knobs for the paid subscription.
 *
 * The paywall applies to EVERY account — there is no founder/grandfather window.
 * Free time is handed out deliberately, one of:
 *   node scripts/bulk-extend-users.js --days 60 --apply    (every existing account)
 *   node scripts/grant-subscription.js <phone> --months 2  (one account)
 *   POST /api/subscription/admin/grant                     (from a tool or CRM)
 *
 * Everything here is env-overridable so pricing can move without a code deploy.
 */

function intFromEnv(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? Math.floor(num) : fallback;
}

/** Master switch — set SUBSCRIPTION_ENABLED=false to hand the whole app back to everyone. */
const SUBSCRIPTION_ENABLED = String(process.env.SUBSCRIPTION_ENABLED || 'true').toLowerCase() !== 'false';

/** Free days every new signup starts with. 0 = pay before first use. */
const TRIAL_DAYS = intFromEnv(process.env.SUBSCRIPTION_TRIAL_DAYS, 0);

/** Extra days the app stays usable after expiry (soft landing). 0 = hard stop. */
const GRACE_DAYS = intFromEnv(process.env.SUBSCRIPTION_GRACE_DAYS, 0);

/** Days before expiry that the renewal banner starts nagging. */
const RENEWAL_REMINDER_DAYS = intFromEnv(process.env.SUBSCRIPTION_REMINDER_DAYS, 7);

/** Support contact shown on the paywall and on payment failures. */
const SUPPORT_PHONE = String(process.env.SUPPORT_PHONE || '').trim();

/**
 * How the customer pays:
 *   'link'     -> Razorpay Payment Link. They are sent to a Razorpay-hosted HTTPS page,
 *                 so this works even while the app itself is served over plain HTTP.
 *   'checkout' -> the in-page Checkout popup. Nicer UX, but needs HTTPS in live mode.
 */
const PAYMENT_MODE =
  String(process.env.SUBSCRIPTION_PAYMENT_MODE || 'link').trim().toLowerCase() === 'checkout'
    ? 'checkout'
    : 'link';

/**
 * Public origin of this deployment, e.g. https://thekedaar.com or http://13.233.10.80.
 * Payment Links bounce the customer back here after paying, so it must be reachable
 * from the open internet — localhost will not work for a real payment.
 */
const PUBLIC_BASE_URL = String(process.env.PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');

/** Ask Razorpay to also SMS the payment link to the customer (may bill you per SMS). */
const LINK_NOTIFY_SMS = String(process.env.RAZORPAY_LINK_NOTIFY_SMS || 'false').toLowerCase() === 'true';

/** Payment links stop being payable after this many minutes. */
const LINK_EXPIRY_MINUTES = intFromEnv(process.env.RAZORPAY_LINK_EXPIRY_MINUTES, 60 * 24);

/**
 * Fallback price list, used when `subscription_plans` has not been seeded yet
 * (e.g. a fresh DB where the migration ran but the seed insert was rolled back).
 * Keep in sync with the seed block in the add_subscription_module migration.
 */
const FALLBACK_PLANS = [
  {
    code: 'STARTER_1M',
    name: 'Starter',
    nameHi: 'स्टार्टर',
    tagline: 'Try the full app for a month',
    taglineHi: 'पूरा ऐप एक महीने चलाकर देखें',
    months: 1,
    durationDays: 0,
    priceInPaise: 11900,
    mrpInPaise: 11900,
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
    mrpInPaise: 35700,
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
    mrpInPaise: 71400,
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
    mrpInPaise: 142800,
    badge: 'Best Value',
    badgeHi: 'सबसे बढ़िया',
    highlight: false,
    sortOrder: 4,
  },
];

module.exports = {
  SUBSCRIPTION_ENABLED,
  TRIAL_DAYS,
  GRACE_DAYS,
  RENEWAL_REMINDER_DAYS,
  SUPPORT_PHONE,
  PAYMENT_MODE,
  PUBLIC_BASE_URL,
  LINK_NOTIFY_SMS,
  LINK_EXPIRY_MINUTES,
  FALLBACK_PLANS,
};
