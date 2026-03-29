#!/bin/bash
# =============================================================
#  ThekeDaari - Deploy / Redeploy Script
#  Run this to deploy or update the app after code changes
#  Usage: chmod +x deploy.sh && ./deploy.sh
# =============================================================

set -e

APP_DIR="/home/ubuntu/Thekedaari"
DEPLOY_DIR="$APP_DIR/deploy"

echo "=========================================="
echo "  Deploying ThekeDaari..."
echo "=========================================="

# --- Pull latest code (if using git) ---
cd "$APP_DIR"
if [ -d .git ]; then
    echo "[1/7] Pulling latest code..."
    git pull origin main
else
    echo "[1/7] No git repo found, skipping pull..."
fi

# --- Backend setup ---
echo "[2/7] Installing backend dependencies..."
cd "$APP_DIR/backend"
npm install --production

echo "[3/7] Generating Prisma client & pushing schema..."
npx prisma generate
npx prisma db push

# --- Frontend setup ---
echo "[4/7] Installing frontend dependencies..."
cd "$APP_DIR/frontend"
npm install

echo "[5/7] Building frontend (this takes 1-2 minutes)..."
npm run build

# --- Copy Nginx config ---
echo "[6/7] Setting up Nginx..."
sudo cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/sites-available/thekedaar
sudo ln -sf /etc/nginx/sites-available/thekedaar /etc/nginx/sites-enabled/thekedaar
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# --- Start/Restart apps with PM2 ---
echo "[7/7] Starting apps with PM2..."
cd "$APP_DIR"
pm2 delete all 2>/dev/null || true
pm2 start "$DEPLOY_DIR/ecosystem.config.js"
pm2 save

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "  Frontend:  http://$(curl -s http://checkip.amazonaws.com)"
echo "  API:       http://$(curl -s http://checkip.amazonaws.com)/api/health"
echo ""
echo "  Useful commands:"
echo "    pm2 status          - Check if apps are running"
echo "    pm2 logs            - View live logs"
echo "    pm2 logs --err      - View error logs only"
echo "    pm2 restart all     - Restart everything"
echo ""
