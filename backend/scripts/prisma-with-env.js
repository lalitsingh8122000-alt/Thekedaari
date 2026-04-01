/**
 * Runs Prisma CLI with DATABASE_URL derived from DB_TARGET + DATABASE_URL_LOCAL/AWS
 * (same logic as src/index.js), since Prisma does not load index.js.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { spawnSync } = require('child_process');

const dbTarget = (process.env.DB_TARGET || 'local').toLowerCase();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    dbTarget === 'aws' ? process.env.DATABASE_URL_AWS : process.env.DATABASE_URL_LOCAL;
}

const prismaArgs = process.argv.slice(2);
if (!prismaArgs.length) {
  console.error('Usage: node scripts/prisma-with-env.js <prisma subcommand> [...args]');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. Add DATABASE_URL to .env or set DATABASE_URL_LOCAL / DATABASE_URL_AWS.'
  );
  process.exit(1);
}

const result = spawnSync('npx', ['prisma', ...prismaArgs], {
  stdio: 'inherit',
  env: process.env,
  cwd: require('path').join(__dirname, '..'),
});
process.exit(result.status === null ? 1 : result.status);
