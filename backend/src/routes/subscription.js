const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const razorpay = require('../services/razorpay');
const { sendRouteError } = require('../utils/serverError');
const { normalizePhone } = require('../utils/validation');
const {
  listPlans,
  findPlanByCode,
  resolveAccess,
  serializePlan,
  activatePaidOrder,
  grantAccess,
} = require('../services/subscriptionService');
const { SUPPORT_PHONE } = require('../config/subscription');

const router = express.Router();
const prisma = new PrismaClient();

/** Short unique receipt — Razorpay caps this field at 40 chars. */
function buildReceipt(userId) {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `tkd_${userId}_${stamp}${rand}`.slice(0, 40);
}

/* ── Plans (public: the pricing page and paywall both read this) ─────────────── */

router.get('/plans', async (req, res) => {
  try {
    const plans = await listPlans(prisma);
    res.json({
      plans,
      currency: 'INR',
      paymentsLive: razorpay.isConfigured(),
      supportPhone: SUPPORT_PHONE || null,
    });
  } catch (err) {
    sendRouteError(res, err, 'subscription plans');
  }
});

/* ── Current user's access state ─────────────────────────────────────────────── */

router.get('/status', auth, async (req, res) => {
  try {
    const access = resolveAccess(req.authUser);

    const [activeSubscription, plans] = await Promise.all([
      prisma.subscription.findFirst({
        where: { userId: req.userId },
        orderBy: [{ endsAt: 'desc' }, { id: 'desc' }],
        include: { plan: true },
      }),
      listPlans(prisma),
    ]);

    res.json({
      ...access,
      paymentsLive: razorpay.isConfigured(),
      plans,
      currentSubscription: activeSubscription
        ? {
            id: activeSubscription.id,
            planCode: activeSubscription.planCode,
            planName: activeSubscription.plan?.name || null,
            planNameHi: activeSubscription.plan?.nameHi || null,
            source: activeSubscription.source,
            startsAt: activeSubscription.startsAt,
            endsAt: activeSubscription.endsAt,
            amount: activeSubscription.amountInPaise / 100,
          }
        : null,
    });
  } catch (err) {
    sendRouteError(res, err, 'subscription status');
  }
});

/* ── Billing history ─────────────────────────────────────────────────────────── */

router.get('/history', auth, async (req, res) => {
  try {
    // Abandoned checkouts stay in `created` forever; show them only while they are
    // fresh enough to be a genuinely stuck payment worth calling support about.
    const stalePendingCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [orders, subscriptions] = await Promise.all([
      prisma.paymentOrder.findMany({
        where: {
          userId: req.userId,
          OR: [
            { status: { not: 'created' } },
            { status: 'created', createdAt: { gte: stalePendingCutoff } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { plan: true },
      }),
      prisma.subscription.findMany({
        where: { userId: req.userId },
        orderBy: { startsAt: 'desc' },
        take: 50,
        include: { plan: true },
      }),
    ]);

    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        planCode: o.planCode,
        planName: o.plan?.name || o.planCode,
        planNameHi: o.plan?.nameHi || o.planCode,
        amount: o.amountInPaise / 100,
        status: o.status,
        method: o.method,
        receipt: o.receipt,
        paymentId: o.razorpayPaymentId,
        paidAt: o.paidAt,
        createdAt: o.createdAt,
      })),
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        planCode: s.planCode,
        planName: s.plan?.name || null,
        planNameHi: s.plan?.nameHi || null,
        source: s.source,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        amount: s.amountInPaise / 100,
        notes: s.notes,
      })),
    });
  } catch (err) {
    sendRouteError(res, err, 'subscription history');
  }
});

/* ── Create a checkout order ─────────────────────────────────────────────────── */

router.post('/orders', auth, async (req, res) => {
  try {
    const plan = await findPlanByCode(prisma, req.body.planCode);
    if (!plan) return res.status(400).json({ error: 'Select a valid plan' });

    if (!razorpay.isConfigured()) {
      return res.status(503).json({
        error: 'Online payment is not switched on yet. Please contact support to activate your plan.',
        code: 'PAYMENT_NOT_CONFIGURED',
        supportPhone: SUPPORT_PHONE || null,
      });
    }

    const receipt = buildReceipt(req.userId);

    // Persist first so a Razorpay success can never land on an unknown order.
    const order = await prisma.paymentOrder.create({
      data: {
        userId: req.userId,
        planId: plan.id,
        planCode: plan.code,
        amountInPaise: plan.priceInPaise,
        currency: 'INR',
        receipt,
        status: 'created',
        provider: 'razorpay',
      },
    });

    let rzpOrder;
    try {
      rzpOrder = await razorpay.createOrder({
        amountInPaise: plan.priceInPaise,
        currency: 'INR',
        receipt,
        notes: {
          userId: String(req.userId),
          phone: req.authUser?.phone || '',
          planCode: plan.code,
          orderId: String(order.id),
        },
      });
    } catch (err) {
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: 'failed', failureReason: String(err.message || '').slice(0, 255) },
      });
      console.error('[subscription] razorpay order create failed:', err.message);
      return res.status(502).json({
        error: 'Could not start the payment. Please try again in a moment.',
        code: 'PAYMENT_GATEWAY_ERROR',
      });
    }

    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    res.status(201).json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      keyId: razorpay.keyId(),
      amountInPaise: plan.priceInPaise,
      amount: plan.priceInPaise / 100,
      currency: 'INR',
      receipt,
      testMode: razorpay.isTestMode(),
      plan: serializePlan(plan),
      prefill: {
        name: req.authUser?.name || '',
        contact: req.authUser?.phone || '',
      },
    });
  } catch (err) {
    sendRouteError(res, err, 'subscription create order');
  }
});

/* ── Verify the checkout callback ────────────────────────────────────────────── */

router.post('/verify', auth, async (req, res) => {
  try {
    const razorpayOrderId = String(req.body.razorpay_order_id || '').trim();
    const razorpayPaymentId = String(req.body.razorpay_payment_id || '').trim();
    const signature = String(req.body.razorpay_signature || '').trim();

    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
      return res.status(400).json({ error: 'Incomplete payment details' });
    }

    const order = await prisma.paymentOrder.findUnique({
      where: { razorpayOrderId },
      include: { plan: true },
    });
    if (!order || order.userId !== req.userId) {
      return res.status(404).json({ error: 'Payment order not found' });
    }

    const valid = razorpay.verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature,
    });
    if (!valid) {
      // Deliberately leave the order in `created`: a garbled callback must not
      // block the webhook from crediting a payment that really did succeed.
      // Only Razorpay's own payment.failed event should mark an order failed.
      console.warn(`[subscription] bad signature for order ${razorpayOrderId} (user ${req.userId})`);
      return res.status(400).json({ error: 'Payment could not be verified', code: 'SIGNATURE_INVALID' });
    }

    const plan = order.plan || (await findPlanByCode(prisma, order.planCode));
    if (!plan) return res.status(500).json({ error: 'Plan for this order is no longer available' });

    const result = await activatePaidOrder(prisma, {
      order,
      plan,
      paymentId: razorpayPaymentId,
      signature,
    });

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        planExpiresAt: true,
        planStatus: true,
        isLegacyUser: true,
        currentPlanCode: true,
      },
    });

    res.json({
      success: true,
      alreadyCredited: !result.credited,
      subscription: resolveAccess(user),
      plan: serializePlan(plan),
    });
  } catch (err) {
    sendRouteError(res, err, 'subscription verify');
  }
});

/* ── Razorpay webhook (safety net when the browser closes mid-payment) ────────── */

router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody;

    if (!razorpay.webhookSecret()) {
      console.warn('[subscription] webhook hit but RAZORPAY_WEBHOOK_SECRET is not set');
      return res.status(503).json({ error: 'Webhook not configured' });
    }
    if (!rawBody || !razorpay.verifyWebhookSignature({ rawBody, signature })) {
      console.warn('[subscription] webhook signature rejected');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body?.event;
    const entity =
      req.body?.payload?.payment?.entity || req.body?.payload?.order?.entity || null;
    const razorpayOrderId = entity?.order_id || entity?.id || null;

    // Always 200 for events we do not act on, otherwise Razorpay keeps retrying.
    if (!['payment.captured', 'order.paid', 'payment.failed'].includes(event) || !razorpayOrderId) {
      return res.json({ received: true, handled: false });
    }

    if (event === 'payment.failed') {
      // Only a still-pending order can move to failed — never undo a credited one.
      const marked = await prisma.paymentOrder.updateMany({
        where: { razorpayOrderId, status: 'created' },
        data: {
          status: 'failed',
          razorpayPaymentId: entity?.id || null,
          method: entity?.method || null,
          failureReason: String(entity?.error_description || 'Payment failed').slice(0, 255),
        },
      });
      return res.json({ received: true, handled: marked.count > 0 });
    }

    const order = await prisma.paymentOrder.findUnique({
      where: { razorpayOrderId },
      include: { plan: true },
    });
    if (!order) {
      console.warn(`[subscription] webhook for unknown order ${razorpayOrderId}`);
      return res.json({ received: true, handled: false });
    }

    const plan = order.plan || (await findPlanByCode(prisma, order.planCode));
    if (!plan) {
      console.error(`[subscription] webhook: plan ${order.planCode} missing for order ${order.id}`);
      return res.json({ received: true, handled: false });
    }

    const result = await activatePaidOrder(prisma, {
      order,
      plan,
      paymentId: entity?.id || null,
      method: entity?.method || null,
    });

    console.log(
      `[subscription] webhook ${event} order=${razorpayOrderId} credited=${result.credited}`
    );
    res.json({ received: true, handled: true, credited: result.credited });
  } catch (err) {
    console.error('[subscription] webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/* ── Admin: grant or extend access manually (cash/UPI collections, goodwill) ──── */

function adminOnly(req, res, next) {
  const configured = String(process.env.ADMIN_API_KEY || '').trim();
  if (!configured) return res.status(503).json({ error: 'Admin API is not configured' });
  if (String(req.headers['x-admin-key'] || '') !== configured) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

router.post('/admin/grant', adminOnly, async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const months = Number(req.body.months || 0);
    const days = Number(req.body.days || 0);

    const user = await prisma.user.findUnique({ where: { phone }, select: { id: true, name: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { expiresAt } = await grantAccess(prisma, {
      userId: user.id,
      months: Number.isFinite(months) ? months : 0,
      days: Number.isFinite(days) ? days : 0,
      planCode: req.body.planCode || null,
      note: req.body.note ? String(req.body.note).slice(0, 255) : 'Granted by admin',
      source: 'manual',
    });

    res.json({ success: true, user: { id: user.id, name: user.name, phone }, expiresAt });
  } catch (err) {
    if (/Specify months or days/.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    sendRouteError(res, err, 'subscription admin grant');
  }
});

module.exports = router;
