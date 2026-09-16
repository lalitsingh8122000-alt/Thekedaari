/**
 * Test helper: move a user's plan expiry around so you can exercise the
 * active / expiring-soon / expired states without waiting real time.
 *
 *   node scripts/set-plan-expiry.js 6377518114 --expired          # lapsed 1 minute ago
 *   node scripts/set-plan-expiry.js 6377518114 --in-days 3        # expires in 3 days (renewal banner)
 *   node scripts/set-plan-expiry.js 6377518114 --at "2026-09-16 15:50"   # exact IST moment
 *   node scripts/set-plan-expiry.js 6377518114 --restore          # back to 3 months from now
 *   node scripts/set-plan-expiry.js 6377518114                    # just show current state
 *
 * Times are IST. Dev/QA only — it writes straight to the access column.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const dbTarget = (process.env.DB_TARGET || 'local').toLowerCase();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    dbTarget === 'aws' ? process.env.DATABASE_URL_AWS : process.env.DATABASE_URL_LOCAL;
}

const { PrismaClient } = require('@prisma/client');
const { normalizePhone } = require('../src/utils/validation');
const { resolveAccess } = require('../src/services/subscriptionService');

const prisma = new PrismaClient();
const IST_MS = 330 * 60 * 1000;
const argv = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i > -1 ? (argv[i + 1] ?? true) : d;
};
const ist = (d) => (d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'none');

function show(user, label) {
  const a = resolveAccess(user);
  console.log(`\n  ${label}`);
  console.log(`    expires (IST) : ${ist(user.planExpiresAt)}`);
  console.log(`    status        : ${a.status}   active=${a.isActive}   daysLeft=${a.daysLeft}`);
  console.log(`    renewal banner: ${a.showRenewalReminder}`);
}

async function main() {
  const phone = normalizePhone(argv[0]);
  if (!phone) {
    console.error('Usage: node scripts/set-plan-expiry.js <phone> [--expired | --in-days N | --at "YYYY-MM-DD HH:MM" | --restore]');
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    select: { id: true, name: true, phone: true, planExpiresAt: true, planStatus: true, isLegacyUser: true, currentPlanCode: true },
  });
  if (!user) {
    console.error(`No user with phone ${phone}`);
    process.exitCode = 1;
    return;
  }

  console.log(`\n  ${user.name} (${user.phone})  id=${user.id}`);
  show(user, 'BEFORE');

  let target;
  if (flag('expired') !== null) target = new Date(Date.now() - 60 * 1000);
  else if (flag('restore') !== null) target = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  else if (flag('in-days') !== null) target = new Date(Date.now() + Number(flag('in-days')) * 24 * 60 * 60 * 1000);
  else if (flag('at') !== null) {
    const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(String(flag('at')).trim());
    if (!m) { console.error('\n  --at needs "YYYY-MM-DD HH:MM" (IST)'); process.exitCode = 1; return; }
    const [, y, mo, d, h, mi] = m;
    target = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi) - IST_MS);
  } else {
    console.log('\n  (read-only — pass --expired / --in-days N / --at "..." / --restore to change)\n');
    return;
  }

  const expired = target.getTime() <= Date.now();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { planExpiresAt: target, planStatus: expired ? 'expired' : user.currentPlanCode ? 'active' : user.planStatus },
    select: { planExpiresAt: true, planStatus: true, isLegacyUser: true, currentPlanCode: true },
  });

  // keep the newest subscription window consistent with the user's access column
  const latest = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: [{ endsAt: 'desc' }, { id: 'desc' }],
    select: { id: true },
  });
  if (latest) {
    await prisma.subscription.update({
      where: { id: latest.id },
      data: { endsAt: target, status: expired ? 'expired' : 'active' },
    });
  }

  show(updated, 'AFTER');
  console.log('\n  Reload the app (or make any API call) to pick it up.\n');
}

main()
  .catch((e) => { console.error('Failed:', e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
