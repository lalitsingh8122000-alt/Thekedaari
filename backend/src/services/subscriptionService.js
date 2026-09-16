/**
 * Subscription domain logic: who has access, for how long, and how a paid order
 * turns into an access window.
 *
 * Access rule (single source of truth): a user has access while
 * `User.planExpiresAt` is in the future (plus GRACE_DAYS). Everything else
 * — planStatus, isLegacyUser — is descriptive only.
 */

const {
  SUBSCRIPTION_ENABLED,
  TRIAL_DAYS,
  GRACE_DAYS,
  RENEWAL_REMINDER_DAYS,
  SUPPORT_PHONE,
  FALLBACK_PLANS,
} = require('../config/subscription');

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * DAY_MS);
}

/**
 * Calendar-month addition that never overflows into the next month:
 * 31 Jan + 1 month = 28/29 Feb, not 3 March.
 */
function addMonths(date, months) {
  const base = new Date(date);
  const day = base.getUTCDate();
  const target = new Date(base.getTime());
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + months);
  const daysInTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(day, daysInTargetMonth));
  return target;
}

/** Applies a plan's length to a start instant. */
function addPlanDuration(startsAt, plan) {
  if (plan.months > 0) return addMonths(startsAt, plan.months);
  if (plan.durationDays > 0) return addDays(startsAt, plan.durationDays);
  throw new Error(`Plan ${plan.code} has neither months nor durationDays`);
}

/** Renewals stack: a plan bought early extends from the current expiry, not from today. */
function nextWindowStart(user, now = new Date()) {
  const current = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;
  return current && current.getTime() > now.getTime() ? current : now;
}

/**
 * Access a brand new signup starts with. Nobody is grandfathered — with the default
 * TRIAL_DAYS=0 a new account has no access at all until it buys a plan.
 */
function initialAccessForNewUser(now = new Date()) {
  if (!SUBSCRIPTION_ENABLED) {
    return { isLegacyUser: false, planStatus: 'active', planExpiresAt: null };
  }
  if (TRIAL_DAYS > 0) {
    return { isLegacyUser: false, planStatus: 'trial', planExpiresAt: addDays(now, TRIAL_DAYS) };
  }
  return { isLegacyUser: false, planStatus: 'none', planExpiresAt: null };
}

function daysBetween(from, to) {
  return Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS);
}

/**
 * Resolves the access state the API and UI both work from.
 * @param {{ planExpiresAt: Date|null, planStatus?: string, isLegacyUser?: boolean, currentPlanCode?: string|null, createdAt?: Date }} user
 */
function resolveAccess(user, now = new Date()) {
  const expiresAt = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const graceEndsAt = expiresAt ? addDays(expiresAt, GRACE_DAYS) : null;

  if (!SUBSCRIPTION_ENABLED) {
    return {
      enforced: false,
      isActive: true,
      inGrace: false,
      status: 'active',
      expiresAt,
      graceEndsAt,
      daysLeft: expiresAt ? Math.max(0, daysBetween(now, expiresAt)) : null,
      isLegacyUser: Boolean(user?.isLegacyUser),
      currentPlanCode: user?.currentPlanCode || null,
      showRenewalReminder: false,
      reminderDays: RENEWAL_REMINDER_DAYS,
      supportPhone: SUPPORT_PHONE || null,
    };
  }

  const hasWindow = Boolean(expiresAt && expiresAt.getTime() > now.getTime());
  const inGrace =
    !hasWindow && Boolean(graceEndsAt && graceEndsAt.getTime() > now.getTime() && GRACE_DAYS > 0);
  const isActive = hasWindow || inGrace;

  // `legacy` and `trial` label a free window someone was given by hand (bulk extend,
  // support grant). Once a plan is bought, planStatus moves on and so does the label.
  let status;
  if (!expiresAt) status = 'none';
  else if (inGrace) status = 'grace';
  else if (!hasWindow) status = 'expired';
  else if (user?.planStatus === 'legacy' && !user?.currentPlanCode) status = 'legacy';
  else if (user?.planStatus === 'trial' && !user?.currentPlanCode) status = 'trial';
  else status = 'active';

  const daysLeft = hasWindow ? Math.max(0, daysBetween(now, expiresAt)) : 0;

  return {
    enforced: true,
    isActive,
    inGrace,
    status,
    expiresAt,
    graceEndsAt: GRACE_DAYS > 0 ? graceEndsAt : null,
    daysLeft,
    isLegacyUser: Boolean(user?.isLegacyUser),
    currentPlanCode: user?.currentPlanCode || null,
    showRenewalReminder: isActive && daysLeft <= RENEWAL_REMINDER_DAYS,
    reminderDays: RENEWAL_REMINDER_DAYS,
    supportPhone: SUPPORT_PHONE || null,
  };
}

function serializePlan(plan) {
  const price = plan.priceInPaise / 100;
  const mrp = plan.mrpInPaise / 100;
  const months = plan.months > 0 ? plan.months : plan.durationDays / 30;
  const perMonth = months > 0 ? Math.round(price / months) : price;
  const savingsPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return {
    code: plan.code,
    name: plan.name,
    nameHi: plan.nameHi,
    tagline: plan.tagline || null,
    taglineHi: plan.taglineHi || null,
    months: plan.months,
    durationDays: plan.durationDays,
    priceInPaise: plan.priceInPaise,
    price,
    mrpInPaise: plan.mrpInPaise,
    mrp,
    perMonth,
    savings: Math.max(0, mrp - price),
    savingsPercent,
    badge: plan.badge || null,
    badgeHi: plan.badgeHi || null,
    highlight: Boolean(plan.highlight),
    sortOrder: plan.sortOrder ?? 0,
  };
}

/** Active plans from the DB, falling back to the built-in price list if the table is empty. */
async function listPlans(prisma) {
  let rows = [];
  try {
    rows = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { priceInPaise: 'asc' }],
    });
  } catch (err) {
    console.error('[subscription] plan lookup failed, using fallback price list:', err.message);
  }
  if (!rows.length) return FALLBACK_PLANS.map(serializePlan);
  return rows.map(serializePlan);
}

/** Finds a sellable plan row by code. Returns the DB row (not serialized) or null. */
async function findPlanByCode(prisma, code) {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) return null;
  return prisma.subscriptionPlan.findFirst({ where: { code: clean, isActive: true } });
}

/**
 * Turns a paid order into an access window.
 *
 * Idempotent by design: the order is flipped created -> paid with a conditional
 * updateMany, so whichever of {verify callback, webhook} arrives second is a no-op
 * and the user is never credited twice.
 *
 * @returns {{ credited: boolean, expiresAt: Date }}
 */
async function activatePaidOrder(prisma, { order, plan, paymentId, signature, method }) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.paymentOrder.updateMany({
      where: { id: order.id, status: 'created' },
      data: {
        status: 'paid',
        razorpayPaymentId: paymentId || null,
        razorpaySignature: signature || null,
        method: method || null,
        paidAt: now,
      },
    });

    if (claimed.count === 0) {
      // Already credited by the other channel — report current state, change nothing.
      const user = await tx.user.findUnique({
        where: { id: order.userId },
        select: { planExpiresAt: true },
      });
      return { credited: false, expiresAt: user?.planExpiresAt || null };
    }

    const user = await tx.user.findUnique({
      where: { id: order.userId },
      select: { planExpiresAt: true },
    });

    const startsAt = nextWindowStart(user, now);
    const endsAt = addPlanDuration(startsAt, plan);

    await tx.subscription.create({
      data: {
        userId: order.userId,
        planId: plan.id || null,
        planCode: plan.code,
        status: 'active',
        source: 'razorpay',
        startsAt,
        endsAt,
        amountInPaise: order.amountInPaise,
        orderId: order.id,
      },
    });

    await tx.user.update({
      where: { id: order.userId },
      data: { planExpiresAt: endsAt, planStatus: 'active', currentPlanCode: plan.code },
    });

    return { credited: true, expiresAt: endsAt };
  });
}

/**
 * Grants access without a payment — manual UPI/cash collections, support goodwill,
 * or extending the founder window. Used by the admin route and the CLI script.
 */
async function grantAccess(prisma, { userId, months = 0, days = 0, planCode = null, note = null, source = 'manual' }) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, planExpiresAt: true },
    });
    if (!user) throw new Error('User not found');

    const startsAt = nextWindowStart(user, now);
    let endsAt = startsAt;
    if (months > 0) endsAt = addMonths(endsAt, months);
    if (days > 0) endsAt = addDays(endsAt, days);
    if (endsAt.getTime() === startsAt.getTime()) throw new Error('Specify months or days to grant');

    // Link the real plan row when a code is given, so the app and billing history show
    // "Starter" rather than the raw STARTER_1M code.
    const plan = planCode
      ? await tx.subscriptionPlan.findUnique({ where: { code: planCode } })
      : null;
    if (planCode && !plan) throw new Error(`Unknown plan code: ${planCode}`);

    await tx.subscription.create({
      data: {
        userId,
        planId: plan?.id || null,
        planCode,
        status: 'active',
        source,
        startsAt,
        endsAt,
        amountInPaise: 0,
        notes: note,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        planExpiresAt: endsAt,
        planStatus: source === 'legacy' ? 'legacy' : 'active',
        // Flagging founders makes the app greet them as early users and, when the
        // courtesy window ends, show "your free access has ended" instead of "expired".
        ...(source === 'legacy' && { isLegacyUser: true }),
        ...(planCode && { currentPlanCode: planCode }),
      },
    });

    return { expiresAt: endsAt };
  });
}

module.exports = {
  DAY_MS,
  addDays,
  addMonths,
  addPlanDuration,
  nextWindowStart,
  initialAccessForNewUser,
  resolveAccess,
  serializePlan,
  listPlans,
  findPlanByCode,
  activatePaidOrder,
  grantAccess,
};
