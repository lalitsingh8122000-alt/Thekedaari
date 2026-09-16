/**
 * Gives free access time to many accounts at once — the tool for handing your existing
 * users a courtesy window after the paywall goes live.
 *
 *   node scripts/bulk-extend-users.js --days 60                 # DRY RUN (default)
 *   node scripts/bulk-extend-users.js --days 60 --apply         # every account
 *   node scripts/bulk-extend-users.js --months 2 --apply
 *   node scripts/bulk-extend-users.js --days 60 --before 2026-09-16 --apply
 *   node scripts/bulk-extend-users.js --days 30 --only-expired --apply
 *
 * Flags
 *   --days N / --months N   how much time to add (at least one required)
 *   --plan CODE             record it as that plan (e.g. STARTER_1M), so the app shows
 *                           "Starter" and it reads as a normal plan that then expires
 *   --before YYYY-MM-DD     only accounts created before this date (IST)
 *   --only-expired          skip anyone who still has access
 *   --as-legacy             mark them founder members: the app shows "Founder member —
 *                           free" while the window lasts, and a warmer message when it
 *                           ends. Recommended for your pre-paywall users.
 *   --note "..."            shows in their billing history
 *   --apply                 actually write; without it nothing changes
 *
 * Time STACKS on whatever is left, so running it twice by accident gives two windows
 * rather than shortening anyone. Each grant is recorded in `subscriptions` with
 * source='manual', so it shows up in the user's billing history.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const dbTarget = (process.env.DB_TARGET || 'local').toLowerCase();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    dbTarget === 'aws' ? process.env.DATABASE_URL_AWS : process.env.DATABASE_URL_LOCAL;
}

const { PrismaClient } = require('@prisma/client');
const { grantAccess } = require('../src/services/subscriptionService');

const prisma = new PrismaClient();
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const val = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  return i > -1 ? (argv[i + 1] ?? d) : d;
};

const IST_MS = 330 * 60 * 1000;
const ist = (d) => (d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'none');

async function main() {
  const days = Number(val('days', 0)) || 0;
  const months = Number(val('months', 0)) || 0;
  const apply = has('apply');
  const onlyExpired = has('only-expired');
  const note = val('note', 'Courtesy access');
  const source = has('as-legacy') ? 'legacy' : 'manual';
  const planCode = val('plan', null);
  const beforeRaw = val('before', null);

  if (!days && !months) {
    console.error('Specify --days N and/or --months N. Nothing to do.');
    process.exitCode = 1;
    return;
  }

  let before = null;
  if (beforeRaw) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(beforeRaw).trim());
    if (!m) {
      console.error('--before needs YYYY-MM-DD');
      process.exitCode = 1;
      return;
    }
    before = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]) - IST_MS);
  }

  const now = new Date();
  const where = {
    ...(before && { createdAt: { lt: before } }),
    ...(onlyExpired && { OR: [{ planExpiresAt: null }, { planExpiresAt: { lt: now } }] }),
  };

  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, phone: true, createdAt: true, planExpiresAt: true },
    orderBy: { id: 'asc' },
  });

  console.log('');
  console.log(`  Grant           : ${months ? months + ' month(s) ' : ''}${days ? days + ' day(s)' : ''}`);
  console.log(`  Created before  : ${before ? ist(before) : 'no limit (all accounts)'}`);
  console.log(`  Only expired    : ${onlyExpired ? 'yes' : 'no'}`);
  console.log(`  Mark as         : ${source === 'legacy' ? 'founder member' : 'manual grant'}`);
  console.log(`  Recorded as plan: ${planCode || '(none)'}`);
  console.log(`  Matching users  : ${users.length}`);
  console.log(`  Mode            : ${apply ? 'APPLY' : 'DRY RUN — add --apply to write'}`);
  console.log('');

  if (!users.length) return;

  if (!apply) {
    users.slice(0, 10).forEach((u) =>
      console.log(`    • ${u.phone}  ${String(u.name).slice(0, 24).padEnd(24)} expires ${ist(u.planExpiresAt)}`)
    );
    if (users.length > 10) console.log(`    … and ${users.length - 10} more`);
    console.log('');
    return;
  }

  let ok = 0;
  let failed = 0;
  for (const user of users) {
    try {
      await grantAccess(prisma, { userId: user.id, months, days, planCode, note, source });
      ok += 1;
      if (ok % 50 === 0) console.log(`    … ${ok}/${users.length}`);
    } catch (err) {
      failed += 1;
      console.error(`    ! ${user.phone}: ${err.message}`);
    }
  }

  const sample = await prisma.user.findFirst({
    where: { id: users[0].id },
    select: { planExpiresAt: true },
  });
  console.log('');
  console.log(`  Extended ${ok} account(s)${failed ? `, ${failed} failed` : ''}.`);
  console.log(`  e.g. ${users[0].phone} now has access until ${ist(sample?.planExpiresAt)}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('Failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
