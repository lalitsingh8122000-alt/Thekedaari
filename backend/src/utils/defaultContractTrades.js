/**
 * Default theka (contract subcontract) types — seeded for every new account
 * and when a user has no trades yet (first load of contract-trades).
 */
const DEFAULT_CONTRACT_TRADE_NAMES = [
  'Color',
  'Furniture',
  'Marble',
  'Plumbing',
  'Steel',
  'Electrical',
  'POP',
];

/**
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} db
 * @param {number} userId
 */
async function ensureDefaultContractTrades(db, userId) {
  const count = await db.contractTrade.count({ where: { userId } });
  if (count > 0) return;
  await db.contractTrade.createMany({
    data: DEFAULT_CONTRACT_TRADE_NAMES.map((name) => ({ name, userId })),
  });
}

module.exports = { DEFAULT_CONTRACT_TRADE_NAMES, ensureDefaultContractTrades };
