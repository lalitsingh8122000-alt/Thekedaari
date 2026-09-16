# Thekedaari Subscription — Setup & Operations

Everything needed to run the paid model. Razorpay **test** keys are already wired into
`backend/.env`, so checkout works end to end today; swap in the live keys when you are
ready to take real money (section 3).

---

## 1. The plans

| Code | Name | Length | Price | MRP¹ | Per month | Badge |
|---|---|---|---|---|---|---|
| `STARTER_1M` | Starter / स्टार्टर | 1 month | ₹119 | ₹119 | ₹119 | — |
| `BUILDER_3M` | Builder / बिल्डर | 3 months | ₹299 | ₹357 | ₹100 | Save 16% |
| `PRO_6M` | Pro Thekedaar / प्रो ठेकेदार | 6 months | ₹529 | ₹714 | ₹88 | Most Popular |
| `USTAAD_12M` | Ustaad / उस्ताद | 12 months | ₹799 | ₹1,428 | ₹67 | Best Value |

¹ MRP is the 1-month rate × months. It drives the strike-through price and the
"you save" badge — it is a reference price, not a separate charge.

Every plan unlocks **all** features. Only the length differs, so there is no
"which tier has attendance?" confusion on a phone in the field.

**To change a price permanently:** edit `FALLBACK_PLANS` in
`backend/src/config/subscription.js`, then run `node scripts/seed-subscription-plans.js`.
It upserts by code and never deletes, so existing subscriptions are unaffected.

**To test a real payment on production without spending money**, flip the live price
list to ₹1 / ₹2 / ₹2 / ₹3 and back. Prices live in the database, so this takes effect
immediately — no redeploy, no restart:

```bash
cd backend
node scripts/set-plan-prices.js            # show what is live now
node scripts/set-plan-prices.js --test     # ₹1 / ₹2 / ₹2 / ₹3
#   ... put a real card or UPI through the app, confirm it credits ...
node scripts/set-plan-prices.js --real     # back to ₹119 / ₹299 / ₹529 / ₹799
```

₹1 is Razorpay's minimum charge, so nothing can go lower. The price never affects how
long a plan lasts — a ₹1 Starter still grants a full month, so remember to expire your
own test account afterwards with
`node scripts/set-plan-expiry.js <phone> --expired`.

> **Put the real prices back as soon as the test succeeds.** While test pricing is live,
> anybody who signs up can buy 12 months for ₹3. Your existing users are on their free
> Starter month and never see the price list, so the exposure is limited to new signups
> during the window — but keep that window to minutes, not hours.

---

## 2. Who pays

**Everyone.** There is no grandfathering and no automatic free window anywhere in the
code. The migration grants nobody access, so once it runs every account — existing and
new — needs a plan. New signups land on the plans screen and cannot touch a single
feature until they pay.

Free time is only ever handed out deliberately, by you.

### Existing users: one free month of Starter

The plan for launch is to give every current account a free 1-month Starter window.
After those 30 days it expires and the app asks them to subscribe, exactly like any
other lapsed plan.

```bash
cd backend
node scripts/bulk-extend-users.js --months 1 --plan STARTER_1M --note "1 month free Starter"
node scripts/bulk-extend-users.js --months 1 --plan STARTER_1M --note "1 month free Starter" --apply
```

The first line is a dry run — it prints who would be affected and changes nothing.

`--plan STARTER_1M` records it as a real Starter window, so the app shows **"Starter"**
(and **"स्टार्टर"** in Hindi) at ₹0 rather than a bare code, and billing history reads as
a normal plan that then ran out.

If you prefer raw SQL, this is the equivalent:

```sql
UPDATE User
SET planExpiresAt   = GREATEST(COALESCE(planExpiresAt, UTC_TIMESTAMP(3)), UTC_TIMESTAMP(3))
                      + INTERVAL 1 MONTH,
    planStatus      = 'active',
    currentPlanCode = 'STARTER_1M';
```

The script is still worth preferring: it also writes a `subscriptions` row so the free
month appears in each user's billing history, and it stacks per-user instead of
flattening anyone who already paid.

### Other grants

```bash
# only people currently locked out
node scripts/bulk-extend-users.js --days 30 --only-expired --apply

# only accounts older than a date
node scripts/bulk-extend-users.js --months 1 --plan STARTER_1M --before 2026-09-16 --apply

# one user (cash / UPI / support goodwill)
node scripts/grant-subscription.js 9876543210 --months 3 --note "UPI paid at office"
```

Granted time **stacks** on whatever is left, so a user who already paid never loses days
and re-running a command by accident adds a window rather than shortening anyone.

`--as-legacy` is an alternative to `--plan`: it marks people founder members, so the app
shows "Founder member — free" and, when the window ends, *"Your free founder access has
ended"* instead of "Your plan has expired". Use whichever message you prefer — with
`--plan STARTER_1M` they get the plain "plan expired" paywall, which is what you want if
the free month should feel like a normal Starter subscription.

### Knobs

```env
SUBSCRIPTION_ENABLED=true      # false = unlock the whole app for everyone (emergency switch)
SUBSCRIPTION_TRIAL_DAYS=0      # free days every new signup starts with; 0 = pay first
SUBSCRIPTION_GRACE_DAYS=0      # extra usable days after expiry
SUBSCRIPTION_REMINDER_DAYS=7   # renewal banner starts this many days out
```

## 3. Razorpay keys

**`backend/.env` is gitignored — it never travels with a `git push`.** Keys must be set
directly on the server. Local dev keeps the `rzp_test_*` keys so development never
touches real cards.

| Environment | Keys | File |
|---|---|---|
| Local dev | `rzp_test_…` | `backend/.env` on your Mac |
| Production | `rzp_live_…` | `/home/ubuntu/Thekedaari/backend/.env` on the server |

### 3.1 On the server

```bash
ssh ubuntu@<your-server>
nano /home/ubuntu/Thekedaari/backend/.env
```

Set the subscription + Razorpay block, then `pm2 restart thekedaar-backend`.
`GET /api/subscription/plans` should report `"paymentsLive": true`.

### 3.2 Webhook (required, not optional)

Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**, in **Live** mode:

- **URL:** `https://<your-domain>/api/subscription/webhook`
- **Secret:** the `RAZORPAY_WEBHOOK_SECRET` value from the server `.env`
- **Events:** `payment.captured`, `order.paid`, `payment.failed`

This is what credits a plan when the customer's phone dies right after paying. Both
paths (browser callback and webhook) are idempotent, so whichever lands second is a
no-op — nobody is charged once and credited twice.

### 3.3 HTTPS is mandatory

Live Checkout, the webhook, and the PWA service worker all require HTTPS. SSL comes
from `sudo certbot --nginx -d <your-domain>`, which writes the 443 block **into**
`/etc/nginx/sites-available/thekedaar`.

`deploy.sh` used to copy the repo's port-80 template over that file and silently drop
HTTPS. It now detects an `ssl_certificate` line and leaves the config alone. If you ever
do need to refresh nginx from the template, run `FORCE_NGINX=1 ./deploy.sh` and then
re-run certbot.

### 3.4 Going live safely

Test mode and live mode are separate worlds at Razorpay: test orders, payments and
webhooks do not exist in live. After switching keys, make one **real ₹119 payment** on
your own account and confirm it appears in the live dashboard and that
`payment_orders.status` is `paid`. Refund it from the dashboard afterwards if you like —
that does not revoke access, so also run `set-plan-expiry.js <phone> --expired` to reset.

## 4. Day-to-day operations

**Give someone access manually** (cash, UPI to your own account, goodwill):

```bash
cd backend
node scripts/grant-subscription.js 9876543210 --months 3 --note "UPI paid at office"
node scripts/grant-subscription.js 9876543210 --days 15 --note "support extension"
```

Granted time **stacks** on whatever is left — nobody loses days they already paid for.

**Check who is expiring this week:**

```sql
SELECT name, phone, planStatus, planExpiresAt
FROM User
WHERE planExpiresAt BETWEEN NOW() AND NOW() + INTERVAL 7 DAY
ORDER BY planExpiresAt;
```

**Revenue so far:**

```sql
SELECT planCode, COUNT(*) AS sales, SUM(amountInPaise)/100 AS revenue
FROM payment_orders WHERE status = 'paid'
GROUP BY planCode;
```

**A user says they paid but has no access:** look up the order, then check whether the
webhook landed.

```sql
SELECT id, planCode, status, razorpayPaymentId, failureReason, createdAt, paidAt
FROM payment_orders
WHERE userId = (SELECT id FROM User WHERE phone = '9876543210')
ORDER BY createdAt DESC;
```

- `status = 'paid'` but no access → check `User.planExpiresAt`; grant manually and
  investigate the logs.
- `status = 'created'` and Razorpay shows the payment captured → the webhook did not
  arrive. Fix the webhook URL/secret, then either re-send the event from the Razorpay
  dashboard or grant the plan manually.
- `status = 'failed'` → `failureReason` has Razorpay's explanation.

---

## 5. How access is decided

`User.planExpiresAt` is the **single source of truth**. A user has access while it is in
the future (plus `SUBSCRIPTION_GRACE_DAYS`). `planStatus`, `isLegacyUser` and
`currentPlanCode` are descriptive — handy for admin queries, never used to grant access.

Request path:

```
auth (JWT + user lookup)  →  requireSubscription  →  feature route
                                    ↓ no live plan
                             402 SUBSCRIPTION_REQUIRED
```

Gated: `/api/projects`, `/roles`, `/contract-trades`, `/workers`, `/attendance`,
`/ledger`, `/finance`, `/dashboard`, `/vendors`, `/vendor-ledger`, `/transactions`.

Open: `/api/auth/*`, `/api/subscription/*`, `/api/blogs`, `/api/health`.

The frontend keys off the `402` + `SUBSCRIPTION_REQUIRED` code to show the plans screen
**without logging the user out** — a lapsed plan is not a lapsed session. In the app,
`/subscription`, `/profile`, `/contact-us`, `/how-to-use` and the policy pages stay
reachable so a locked-out user can still pay, get help, or read the guide.

Nothing is ever deleted when a plan ends. Every project, worker, attendance row and
ledger entry is exactly where it was, and reappears the moment a plan is bought. The
paywall says so in both languages, because that is the first question a contractor asks.

---

## 6. Files

**Backend**

| Path | Role |
|---|---|
| `src/config/subscription.js` | Dates, price list, env knobs |
| `src/services/subscriptionService.js` | Access resolution, activation, renewal stacking |
| `src/services/razorpay.js` | Razorpay REST calls + signature verification (no npm dep) |
| `src/middleware/requireSubscription.js` | The 402 gate |
| `src/routes/subscription.js` | plans, status, orders, verify, webhook, history, admin grant |
| `scripts/seed-subscription-plans.js` | Upsert the price list from code |
| `scripts/set-plan-prices.js` | Flip live prices to ₹1–₹3 for a real payment test, and back |
| `scripts/bulk-extend-users.js` | Give many accounts free time (dry-run by default) |
| `scripts/grant-subscription.js` | Manual grant for one account |
| `scripts/set-plan-expiry.js` | Dev/QA: move an expiry to test active / expiring / expired |
| `prisma/migrations/20260817120000_add_subscription_module/` | Tables + plan seed (grants nobody access) |

**Frontend**

| Path | Role |
|---|---|
| `src/contexts/SubscriptionContext.jsx` | Status, caching, 402 listener, refresh on focus |
| `src/lib/razorpay.js` | Checkout script loader + buy flow |
| `src/lib/subscription.js` | Formatting, plan accents, unlocked-path list |
| `src/components/subscription/PaywallScreen.jsx` | Full-page price list when locked |
| `src/components/subscription/PlansGrid.jsx` | Price list + checkout (shared) |
| `src/components/subscription/PlanCard.jsx` | One plan card |
| `src/components/subscription/SubscriptionStatusCard.jsx` | "Plan active — 61 days left" |
| `src/components/subscription/SubscriptionBanner.jsx` | Renewal nudge inside the app |
| `src/components/subscription/BillingHistory.jsx` | Past payments |
| `src/app/subscription/page.js` | Manage-plan page |

---

## 7. Go-live checklist

The migration locks every existing user the instant it runs, so do the deploy with the
paywall switched off, hand out the courtesy window, then switch it on. That way nobody
sees a paywall they were not meant to see.

**1 — Back up production**

```bash
mysqldump -u <user> -p --databases thekedaar_db > backup-before-subscription.sql
```

**2 — Deploy with the paywall OFF**

On the server, in `backend/.env`, before deploying:

```env
SUBSCRIPTION_ENABLED=false
```

Then `git push` from your machine and on the server:
`cd /home/ubuntu/Thekedaari && ./deploy.sh`

The tables are created and the plans seeded, but nobody is blocked yet.

**3 — Give your existing users their free month of Starter**

```bash
cd /home/ubuntu/Thekedaari/backend
node scripts/bulk-extend-users.js --months 1 --plan STARTER_1M --note "1 month free Starter"
node scripts/bulk-extend-users.js --months 1 --plan STARTER_1M --note "1 month free Starter" --apply
```

Check it landed:
```sql
SELECT planStatus, COUNT(*) FROM User GROUP BY planStatus;
```

**4 — Add the live Razorpay keys and turn the paywall on**

Set the Razorpay block (section 3) and flip `SUBSCRIPTION_ENABLED=true`, then
`pm2 restart thekedaar-backend`. Add the live webhook in the Razorpay dashboard.

**5 — Verify**

- `curl https://<domain>/api/subscription/plans` → four plans, `"paymentsLive": true`.
- Log in as an existing user → app works normally, shows "Starter", ~30 days left.
- Register a brand new account → lands straight on the plans screen, every feature 402.
- Make one real payment end to end and confirm it credits. To avoid spending ₹119,
  run `node scripts/set-plan-prices.js --test` first, pay ₹1, then immediately
  `node scripts/set-plan-prices.js --real`. Expire your own test account afterwards
  with `node scripts/set-plan-expiry.js <phone> --expired`.

**Keep an eye on**

- `SELECT status, COUNT(*) FROM payment_orders GROUP BY status;` — a pile of `created`
  rows with no `paid` means the webhook is not reaching you.
- `pm2 logs thekedaar-backend | grep subscription` — signature rejections and webhook
  errors are logged with the `[subscription]` prefix.
- The free Starter month ending in a week (your renewal wave — the in-app banner
  nags them automatically from 7 days out):
  ```sql
  SELECT name, phone, planExpiresAt FROM User
  WHERE planExpiresAt BETWEEN NOW() AND NOW() + INTERVAL 7 DAY ORDER BY planExpiresAt;
  ```
