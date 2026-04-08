#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Starting MySQL (Docker)..."
docker compose up -d mysql

echo "Waiting for MySQL to accept connections..."
ok=0
for i in $(seq 1 60); do
  if docker compose exec -T mysql mysqladmin ping -h 127.0.0.1 -u root -proot_local_dev_only --silent 2>/dev/null; then
    ok=1
    break
  fi
  sleep 1
done
if [ "$ok" -ne 1 ]; then
  echo "Timeout waiting for MySQL."
  exit 1
fi
echo "MySQL is up."

cd "$ROOT/backend"
export DB_TARGET="${DB_TARGET:-local}"
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="${DATABASE_URL_LOCAL:-mysql://thekedaar:Thekedaar%40Prod2026@127.0.0.1:3306/thekedaar_db}"
fi
echo "Running Prisma migrations..."
npx prisma migrate deploy
npx prisma generate

echo "Done. Start the API with: cd backend && npm run dev"
