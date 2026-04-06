/**
 * If prisma migrate was never applied, contract/theka queries return 500.
 * This script adds ContractTrade + columns only when missing (safe to re-run).
 *
 * Usage: npm run db:apply-theka
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

function resolveDatabaseUrl() {
  const dbTarget = (process.env.DB_TARGET || 'local').toLowerCase();
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  return dbTarget === 'aws' ? process.env.DATABASE_URL_AWS : process.env.DATABASE_URL_LOCAL;
}

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].c > 0;
}

async function tableExists(conn, table) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return rows[0].c > 0;
}

async function fkExists(conn, table, name) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.TABLE_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
    [table, name]
  );
  return rows[0].c > 0;
}

async function indexExists(conn, table, name) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, name]
  );
  return rows[0].c > 0;
}

async function main() {
  const url = resolveDatabaseUrl();
  if (!url) {
    console.error('Set DATABASE_URL or DATABASE_URL_LOCAL in .env');
    process.exit(1);
  }
  const conn = await mysql.createConnection(url);
  try {
    if (!(await tableExists(conn, 'ContractTrade'))) {
      await conn.query(`
        CREATE TABLE \`ContractTrade\` (
          \`id\` INTEGER NOT NULL AUTO_INCREMENT,
          \`name\` VARCHAR(100) NOT NULL,
          \`userId\` INTEGER NOT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      console.log('Created table ContractTrade');
    } else {
      console.log('Table ContractTrade already exists');
    }

    if (!(await indexExists(conn, 'ContractTrade', 'ContractTrade_userId_idx'))) {
      await conn.query(`CREATE INDEX \`ContractTrade_userId_idx\` ON \`ContractTrade\`(\`userId\`)`);
    }
    if (!(await fkExists(conn, 'ContractTrade', 'ContractTrade_userId_fkey'))) {
      await conn.query(`
        ALTER TABLE \`ContractTrade\` ADD CONSTRAINT \`ContractTrade_userId_fkey\`
        FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      `);
    }

    if (!(await columnExists(conn, 'Worker', 'workerType'))) {
      await conn.query(
        `ALTER TABLE \`Worker\` ADD COLUMN \`workerType\` VARCHAR(20) NOT NULL DEFAULT 'Labour'`
      );
      console.log('Added Worker.workerType');
    }
    if (!(await columnExists(conn, 'Worker', 'contractTradeId'))) {
      await conn.query(`ALTER TABLE \`Worker\` ADD COLUMN \`contractTradeId\` INTEGER NULL`);
      console.log('Added Worker.contractTradeId');
    }
    if (!(await indexExists(conn, 'Worker', 'Worker_contractTradeId_idx'))) {
      await conn.query(`CREATE INDEX \`Worker_contractTradeId_idx\` ON \`Worker\`(\`contractTradeId\`)`);
    }
    if (!(await fkExists(conn, 'Worker', 'Worker_contractTradeId_fkey'))) {
      await conn.query(`
        ALTER TABLE \`Worker\` ADD CONSTRAINT \`Worker_contractTradeId_fkey\`
        FOREIGN KEY (\`contractTradeId\`) REFERENCES \`ContractTrade\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      `);
    }

    if (!(await columnExists(conn, 'Expense', 'contractTradeId'))) {
      await conn.query(`ALTER TABLE \`Expense\` ADD COLUMN \`contractTradeId\` INTEGER NULL`);
      console.log('Added Expense.contractTradeId');
    }
    if (!(await indexExists(conn, 'Expense', 'Expense_contractTradeId_idx'))) {
      await conn.query(`CREATE INDEX \`Expense_contractTradeId_idx\` ON \`Expense\`(\`contractTradeId\`)`);
    }
    if (!(await fkExists(conn, 'Expense', 'Expense_contractTradeId_fkey'))) {
      await conn.query(`
        ALTER TABLE \`Expense\` ADD CONSTRAINT \`Expense_contractTradeId_fkey\`
        FOREIGN KEY (\`contractTradeId\`) REFERENCES \`ContractTrade\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      `);
    }

    console.log('Theka schema check complete. Run: npm run db:generate (or npx prisma generate with DATABASE_URL set)');
  } finally {
    await conn.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
