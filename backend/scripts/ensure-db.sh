#!/usr/bin/env bash
# Automatically starts MySQL (Docker) and runs Prisma migrations before dev server.
# Called via the "predev" npm hook in package.json.
set -e

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="$ROOT/backend"

# ── 1. Docker check ──────────────────────────────────────────────────────────
if ! docker info > /dev/null 2>&1; then
  echo ""
  echo "  Docker is not running."
  echo "  Please open Docker Desktop and wait for it to start, then run: npm run dev"
  echo ""
  exit 1
fi

# ── 2. Start MySQL container (idempotent — safe to call when already running) ─
echo "→ Ensuring MySQL container is running..."
docker compose -f "$ROOT/docker-compose.yml" up -d mysql

# ── 3. Wait until MySQL is ready to accept connections ───────────────────────
echo "→ Waiting for MySQL to be ready..."
for i in $(seq 1 60); do
  if docker compose -f "$ROOT/docker-compose.yml" exec -T mysql \
      mysqladmin ping -h 127.0.0.1 -u root -proot_local_dev_only --silent 2>/dev/null; then
    echo "→ MySQL is ready."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "  Timeout waiting for MySQL after 60 seconds. Check Docker logs:"
    echo "  docker compose logs mysql"
    exit 1
  fi
  sleep 1
done

# ── 4. Run Prisma migrations (safe — skipped if already up to date) ───────────
cd "$BACKEND"

# Load .env so DATABASE_URL is available for the prisma CLI
if [ -f .env ]; then
  set -o allexport
  # shellcheck disable=SC1091
  source .env
  set +o allexport
fi

export DB_TARGET="${DB_TARGET:-local}"
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="${DATABASE_URL_LOCAL:-mysql://thekedaar:Thekedaar%40Prod2026@127.0.0.1:3306/thekedaar_db}"
fi

echo "→ Applying Prisma migrations..."
npx prisma migrate deploy
echo "→ DB setup complete. Starting server..."
