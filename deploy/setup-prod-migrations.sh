#!/bin/bash
# =============================================================
#  ThekeDaari - ONE-TIME Production Migration Baseline
#
#  Run this ONCE on the production server BEFORE the first
#  deploy that uses "prisma migrate deploy".
#
#  What it does:
#    - Creates the _prisma_migrations tracking table
#    - Marks all 9 existing migrations as "already applied"
#      (does NOT run any SQL — schema is already correct)
#
#  After running this, every future deploy.sh run will
#  automatically apply only NEW migrations safely.
#
#  Usage (on production server):
#    cd /home/ubuntu/Thekedaari
#    chmod +x deploy/setup-prod-migrations.sh
#    ./deploy/setup-prod-migrations.sh
# =============================================================

set -e

APP_DIR="/home/ubuntu/Thekedaari"
cd "$APP_DIR/backend"

# Load production environment variables
if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Check your backend/.env file."
  exit 1
fi

echo "=================================================="
echo "  ThekeDaari - Production Migration Baseline"
echo "=================================================="
echo ""
echo "  This will mark all existing migrations as applied"
echo "  in the _prisma_migrations tracking table."
echo "  No schema changes will be made to your data."
echo ""
echo "  DATABASE: $DATABASE_URL" | sed 's|://[^@]*@|://***:***@|'
echo ""
read -p "  Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "  Aborted."
  exit 0
fi

echo ""
echo "  Generating Prisma client..."
npx prisma generate

echo ""
echo "  Marking all existing migrations as applied..."
echo ""

MIGRATIONS=(
  "20250401120000_contract_theka"
  "20250402120000_attendance_split_half_day"
  "20250404100000_contract_theka_trades"
  "20250406120000_ledger_expense_link"
  "20260402120000_ledger_payment_group"
  "20260403120000_worker_extra_advance_balance"
  "20260406120000_add_leads_table"
  "20260410000000_add_blogs_table"
  "20260504100000_add_vendor_module"
)

for migration in "${MIGRATIONS[@]}"; do
  echo "  → Resolving: $migration"
  npx prisma migrate resolve --applied "$migration"
done

echo ""
echo "=================================================="
echo "  Baseline complete! All migrations marked."
echo ""
echo "  You can now run ./deploy/deploy.sh for all"
echo "  future deployments."
echo "=================================================="
