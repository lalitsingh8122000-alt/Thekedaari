/**
 * Flips the live price list between the real prices and tiny amounts, so you can put a
 * real card / UPI through production without spending money.
 *
 *   node scripts/set-plan-prices.js              # show what is live right now
 *   node scripts/set-plan-prices.js --test       # ₹1 / ₹2 / ₹2 / ₹3
 *   node scripts/set-plan-prices.js --real       # ₹119 / ₹299 / ₹529 / ₹799
 *
 * Prices live in the `subscription_plans` table, so this takes effect immediately —
 * no redeploy, no restart. The real prices stay the code default, so a fresh deploy
 * never ships test pricing by accident.
 *
 * PUT THE REAL PRICES BACK as soon as the test payment is confirmed: while test pricing
 * is live, anyone who signs up can buy 12 months for ₹3.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const dbTarget = (process.env.DB_TARGET || 'local').toLowerCase();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    dbTarget === 'aws' ? process.env.DATABASE_URL_AWS : process.env.DATABASE_URL_LOCAL;
}

const { PrismaClient } = require('@prisma/client');
const { FALLBACK_PLANS } = require('../src/config/subscription');

const prisma = new PrismaClient();

// Razorpay's minimum charge is ₹1, so nothing here may go below 100 paise.
const TEST_RUPEES = { STARTER_1M: 1, BUILDER_3M: 2, PRO_6M: 2, USTAAD_12M: 3 };

const argv = process.argv.slice(2);
const wantTest = argv.includes('--test');
const wantReal = argv.includes('--real');

async function show(label) {
  const rows = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log(`\n  ${label}`);
  for (const r of rows) {
    const mrp = r.mrpInPaise > r.priceInPaise ? `  (was ₹${r.mrpInPaise / 100})` : '';
    console.log(`    ${r.code.padEnd(12)} ${String(r.months + 'mo').padStart(4)}   ₹${String(r.priceInPaise / 100).padEnd(6)}${mrp}`);
  }
  const testish = rows.some((r) => r.priceInPaise < 10000);
  console.log(`\n  Mode: ${testish ? '*** TEST PRICING IS LIVE — put the real prices back after testing ***' : 'real pricing'}\n`);
}

async function main() {
  if (wantTest && wantReal) {
    console.error('Pick one: --test or --real');
    process.exitCode = 1;
    return;
  }

  if (!wantTest && !wantReal) {
    await show('Live price list');
    console.log('  Use --test for ₹1/₹2/₹2/₹3, or --real to restore.\n');
    return;
  }

  for (const plan of FALLBACK_PLANS) {
    // mrp uses the same "1-month rate x months" rule as production, so the
    // strike-through price and "you save" badge still read sensibly while testing.
    const priceInPaise = wantTest
      ? (TEST_RUPEES[plan.code] ?? 1) * 100
      : plan.priceInPaise;
    const mrpInPaise = wantTest
      ? (TEST_RUPEES.STARTER_1M ?? 1) * 100 * (plan.months || 1)
      : plan.mrpInPaise;

    if (priceInPaise < 100) throw new Error(`${plan.code}: Razorpay will not accept less than ₹1`);

    await prisma.subscriptionPlan.updateMany({
      where: { code: plan.code },
      data: { priceInPaise, mrpInPaise: Math.max(mrpInPaise, priceInPaise) },
    });
  }

  await show(wantTest ? 'Switched to TEST pricing' : 'Restored REAL pricing');
  if (wantTest) {
    console.log('  Reminder: node scripts/set-plan-prices.js --real  <- run this right after the test\n');
  }
}

main()
  .catch((e) => {
    console.error('Failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
