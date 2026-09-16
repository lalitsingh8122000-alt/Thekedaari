/**
 * Blocks feature APIs when the caller has no live subscription.
 *
 * Mounted in index.js after `auth`, so `req.authUser` already carries the access
 * fields and this costs zero extra queries.
 *
 * Answers 402 Payment Required with `code: 'SUBSCRIPTION_REQUIRED'` — the frontend
 * keys off that code to show the plans screen instead of logging the user out.
 */

const { resolveAccess } = require('../services/subscriptionService');

function requireSubscription(req, res, next) {
  const user = req.authUser;
  if (!user) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const access = resolveAccess(user);
  req.subscription = access;

  if (access.isActive) return next();

  return res.status(402).json({
    error: 'Your Thekedaari plan has ended. Choose a plan to continue.',
    code: 'SUBSCRIPTION_REQUIRED',
    subscription: {
      status: access.status,
      expiresAt: access.expiresAt,
      isLegacyUser: access.isLegacyUser,
      supportPhone: access.supportPhone,
    },
  });
}

module.exports = requireSubscription;
