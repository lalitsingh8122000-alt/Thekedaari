/**
 * Default worker roles — seeded for every new account and backfilled when missing.
 */
const DEFAULT_ROLE_NAMES = ['Karigar', 'Labour', 'Supervisor', 'Other', 'Contractor'];

/**
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} db
 * @param {number} userId
 */
async function ensureDefaultRoles(db, userId) {
  const existing = await db.role.findMany({
    where: { userId },
    select: { name: true },
  });
  const have = new Set(existing.map((r) => r.name.toLowerCase()));
  const missing = DEFAULT_ROLE_NAMES.filter((n) => !have.has(n.toLowerCase()));
  if (missing.length === 0) return;
  await db.role.createMany({
    data: missing.map((name) => ({ name, userId })),
  });
}

module.exports = { DEFAULT_ROLE_NAMES, ensureDefaultRoles };
