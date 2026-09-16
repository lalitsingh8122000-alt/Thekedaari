/**
 * Upserts the price list in `subscription_plans` from backend/src/config/subscription.js.
 *
 * Safe to re-run: it updates existing rows by code and never deletes.
 * Use it after changing prices, or on a DB where the migration seed did not run.
 *
 *   node scripts/seed-subscription-plans.js
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

async function main() {
  for (const plan of FALLBACK_PLANS) {
    const data = {
      name: plan.name,
      nameHi: plan.nameHi,
      tagline: plan.tagline,
      taglineHi: plan.taglineHi,
      months: plan.months,
      durationDays: plan.durationDays,
      priceInPaise: plan.priceInPaise,
      mrpInPaise: plan.mrpInPaise,
      badge: plan.badge,
      badgeHi: plan.badgeHi,
      highlight: plan.highlight,
      isActive: true,
      sortOrder: plan.sortOrder,
    };
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: data,
      create: { code: plan.code, ...data },
    });
    console.log(`  ✓ ${plan.code.padEnd(12)} ₹${plan.priceInPaise / 100}`);
  }
  console.log(`\nSeeded ${FALLBACK_PLANS.length} plans.`);
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
