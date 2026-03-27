#!/bin/bash
# =============================================================
#  ThekeDaari - AWS EC2 Server Setup Script
#  Run this ONCE on a fresh Ubuntu 22.04/24.04 EC2 instance
#  Usage: chmod +x setup-server.sh && sudo ./setup-server.sh
# =============================================================

set -e

echo "=========================================="
echo "  ThekeDaari Server Setup Starting..."
echo "=========================================="

# --- 1. System Update ---
echo "[1/6] Updating system packages..."
apt update && apt upgrade -y

# --- 2. Install Node.js 20 ---
echo "[2/6] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# --- 3. Install MySQL ---
echo "[3/6] Installing MySQL Server..."
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

echo "Setting up MySQL database and user..."
mysql -e "CREATE DATABASE IF NOT EXISTS thekedaar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'thekedaar'@'localhost' IDENTIFIED BY 'Thekedaar@Prod2026';"
mysql -e "GRANT ALL PRIVILEGES ON thekedaar_db.* TO 'thekedaar'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "MySQL setup complete! Database: thekedaar_db, User: thekedaar"

# --- 4. Install Nginx ---
echo "[4/6] Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# --- 5. Install PM2 ---
echo "[5/6] Installing PM2 (process manager)..."
npm install -g pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# --- 6. Install Git ---
echo "[6/6] Installing Git..."
apt install -y git

echo ""
echo "=========================================="
echo "  Server Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Clone your repo:  git clone <your-repo-url> /home/ubuntu/ThekeDaari"
echo "  2. Run the deploy script:  cd /home/ubuntu/ThekeDaari && chmod +x deploy/deploy.sh && ./deploy/deploy.sh"
echo ""
