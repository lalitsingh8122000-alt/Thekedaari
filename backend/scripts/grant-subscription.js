/**
 * Grants or extends a user's access from the command line — for cash/UPI payments
 * collected outside Razorpay, support goodwill, or testing.
 *
 *   node scripts/grant-subscription.js 9876543210 --months 3
 *   node scripts/grant-subscription.js 9876543210 --days 15 --note "UPI paid to office"
 *
 * Time stacks on top of any remaining access, it does not overwrite it.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const dbTarget = (process.env.DB_TARGET || 'local').toLowerCase();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    dbTarget === 'aws' ? process.env.DATABASE_URL_AWS : process.env.DATABASE_URL_LOCAL;
}

const { PrismaClient } = require('@prisma/client');
const { grantAccess } = require('../src/services/subscriptionService');
const { normalizePhone } = require('../src/utils/validation');

const prisma = new PrismaClient();

function flag(name, fallback = null) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx > -1 ? process.argv[idx + 1] : fallback;
}

async function main() {
  const phone = normalizePhone(process.argv[2]);
  const months = Number(flag('months', 0)) || 0;
  const days = Number(flag('days', 0)) || 0;
  const note = flag('note', 'Granted from CLI');
  const planCode = flag('plan', null);

  if (!phone || (!months && !days)) {
    console.error('Usage: node scripts/grant-subscription.js <phone> --months N [--days N] [--note "..."] [--plan CODE]');
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { phone }, select: { id: true, name: true } });
  if (!user) {
    console.error(`No user with phone ${phone}`);
    process.exitCode = 1;
    return;
  }

  const { expiresAt } = await grantAccess(prisma, {
    userId: user.id,
    months,
    days,
    planCode,
    note,
    source: 'manual',
  });

  console.log(`✓ ${user.name} (${phone}) now has access until`);
  console.log(`  ${new Date(expiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
}

main()
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
