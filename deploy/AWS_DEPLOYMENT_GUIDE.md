# ThekeDaari - AWS Deployment Guide (Beginner Friendly)

Complete guide to host ThekeDaari on AWS Free Tier using a single EC2 instance.

**What we'll set up:**
```
Internet → EC2 Instance (Ubuntu)
            ├── Nginx (port 80) ← reverse proxy
            │    ├── yourdomain.com/     → Next.js (port 3000)
            │    └── yourdomain.com/api/ → Express (port 5000)
            ├── MySQL (port 3306, local only)
            └── PM2 (keeps Node apps alive)
```

**Cost:** $0 for 12 months (AWS Free Tier)

---

## PART 1: Create AWS Account & Launch EC2

### Step 1.1 — Create AWS Account

1. Go to https://aws.amazon.com/free
2. Click **"Create a Free Account"**
3. Fill in email, password, account name
4. Add your **debit/credit card** (they charge ₹2 to verify, refunded immediately)
5. Choose **"Basic Support - Free"** plan
6. Wait for account activation (usually 5-10 minutes)

### Step 1.2 — Launch EC2 Instance

1. Go to **AWS Console** → search **"EC2"** → click **"EC2"**
2. Make sure your **Region** (top-right) is set to **"Asia Pacific (Mumbai) ap-south-1"** (closest to India)
3. Click **"Launch Instance"**

**Fill in these settings:**

| Setting | Value |
|---------|-------|
| **Name** | `thekedaar-server` |
| **OS Image (AMI)** | Ubuntu Server 24.04 LTS (Free tier eligible) |
| **Instance type** | `t2.micro` (Free tier eligible) |
| **Key pair** | Click "Create new key pair" → name it `thekedaar-key` → type: RSA → format: `.pem` → Download it! |
| **Network settings** | Check: ✅ Allow SSH, ✅ Allow HTTP, ✅ Allow HTTPS |
| **Storage** | Change to **25 GB** gp3 (Free tier allows 30 GB) |

4. Click **"Launch Instance"**
5. Wait 1-2 minutes for it to start

### Step 1.3 — Set Up Elastic IP (so IP doesn't change)

1. Go to **EC2 → Elastic IPs** (left sidebar under "Network & Security")
2. Click **"Allocate Elastic IP address"** → **"Allocate"**
3. Select the new IP → **Actions → "Associate Elastic IP address"**
4. Select your `thekedaar-server` instance → **"Associate"**
5. **Note down this IP** — this is your permanent server IP (e.g., `13.232.xxx.xxx`)

> **IMPORTANT:** Elastic IP is free ONLY when attached to a running instance.
> If you stop the instance, release the Elastic IP to avoid charges.

---

## PART 2: Connect to Your Server

### From Mac (Terminal)

```bash
# 1. Move the key file to a safe location
mv ~/Downloads/thekedaar-key.pem ~/.ssh/
chmod 400 ~/.ssh/thekedaar-key.pem

# 2. Connect to your server (replace with YOUR Elastic IP)
ssh -i ~/.ssh/thekedaar-key.pem ubuntu@YOUR_ELASTIC_IP
```

**First time it asks "Are you sure you want to continue connecting?"** → type `yes`

You should see something like:
```
Welcome to Ubuntu 24.04 LTS
ubuntu@ip-172-31-xx-xx:~$
```

You're now inside your AWS server!

---

## PART 3: Set Up the Server

### Step 3.1 — Push Code to GitHub

Before setting up the server, push your code to GitHub from your **Mac terminal** (NOT the SSH terminal):

```bash
# On your Mac, in the project folder
cd ~/ThekeDaari

# Initialize git
git init
git add .
git commit -m "Initial commit - ThekeDaari app"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ThekeDaari.git
git branch -M main
git push -u origin main
```

### Step 3.2 — Run Setup Script on EC2

Now, on the **SSH terminal** (connected to EC2):

```bash
# Clone your repo
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/ThekeDaari.git
cd ThekeDaari

# Run the server setup script
chmod +x deploy/setup-server.sh
sudo ./deploy/setup-server.sh
```

This installs Node.js, MySQL, Nginx, PM2, and Git. Takes about 3-5 minutes.

### Step 3.3 — Configure Environment Files

```bash
# Backend .env
cd /home/ubuntu/ThekeDaari/backend
cp .env.example .env
nano .env
```

Update the `.env` file:
```
DATABASE_URL="mysql://thekedaar:Thekedaar@Prod2026@localhost:3306/thekedaar_db"
JWT_SECRET="paste-a-random-string-here"
PORT=5000
```

To generate a random JWT secret:
```bash
openssl rand -hex 32
```
Copy the output and paste it as your JWT_SECRET value.

Press **Ctrl+X**, then **Y**, then **Enter** to save.

```bash
# Frontend .env
cd /home/ubuntu/ThekeDaari/frontend
cp .env.example .env.local
nano .env.local
```

Update with your Elastic IP:
```
NEXT_PUBLIC_API_URL=http://YOUR_ELASTIC_IP/api
```

Press **Ctrl+X**, then **Y**, then **Enter** to save.

### Step 3.4 — Deploy!

```bash
cd /home/ubuntu/ThekeDaari
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

This will:
- Install all npm packages
- Generate Prisma client and create database tables
- Build the Next.js frontend
- Configure Nginx
- Start both apps with PM2

Takes about 2-3 minutes.

### Step 3.5 — Verify Everything Works

```bash
# Check if both apps are running
pm2 status
```

You should see:
```
┌─────────────────────┬────┬──────┬───────┬────────┐
│ name                │ id │ mode │ status│ cpu    │
├─────────────────────┼────┼──────┼───────┼────────┤
│ thekedaar-backend   │ 0  │ fork │ online│ 0%     │
│ thekedaar-frontend  │ 1  │ fork │ online│ 0%     │
└─────────────────────┴────┴──────┴───────┴────────┘
```

Now open your browser and go to:
- **App:** `http://YOUR_ELASTIC_IP`
- **API Health:** `http://YOUR_ELASTIC_IP/api/health`

🎉 Your app is live!

---

## PART 4: Useful Daily Commands

### SSH into your server
```bash
ssh -i ~/.ssh/thekedaar-key.pem ubuntu@YOUR_ELASTIC_IP
```

### Check app status
```bash
pm2 status
```

### View logs (real-time)
```bash
pm2 logs                          # all logs
pm2 logs thekedaar-backend        # backend only
pm2 logs thekedaar-frontend       # frontend only
pm2 logs --err                    # errors only
```

### Restart apps
```bash
pm2 restart all                   # restart everything
pm2 restart thekedaar-backend     # restart backend only
```

### Deploy new code changes
```bash
cd /home/ubuntu/ThekeDaari
git pull origin main
./deploy/deploy.sh
```

### Check MySQL
```bash
mysql -u thekedaar -p thekedaar_db
# Enter password: Thekedaar@Prod2026
# Then run SQL queries like:
# SHOW TABLES;
# SELECT * FROM User;
# exit;
```

### Check Nginx status
```bash
sudo systemctl status nginx
sudo nginx -t                     # test config for errors
sudo systemctl reload nginx       # reload after config change
```

### Check disk space
```bash
df -h
```

### Check memory usage
```bash
free -h
```

---

## PART 5: Add Free SSL (HTTPS) — Optional but Recommended

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is set up automatically
# Test it with:
sudo certbot renew --dry-run
```

> You need a **domain name** pointing to your Elastic IP for SSL to work.
> Free domains: freenom.com | Cheap domains: namecheap.com (~₹200/year for .xyz)

---

## PART 6: Connect a Domain Name (Optional)

1. Buy a domain (e.g., `thekedaari.com`) from Namecheap, GoDaddy, etc.
2. In your domain DNS settings, add an **A Record**:
   - **Host:** `@`
   - **Value:** `YOUR_ELASTIC_IP`
   - **TTL:** Automatic
3. Wait 5-30 minutes for DNS to update
4. Update your frontend `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   ```
5. Rebuild and restart:
   ```bash
   cd /home/ubuntu/ThekeDaari
   ./deploy/deploy.sh
   ```

---

## PART 7: Troubleshooting

### App not loading in browser?
```bash
# Check if apps are running
pm2 status

# If status shows "errored", check logs
pm2 logs --err

# Check if Nginx is running
sudo systemctl status nginx

# Check if port 80 is open (from your Mac)
curl http://YOUR_ELASTIC_IP/api/health
```

### Cannot connect via SSH?
- Check EC2 Security Group allows SSH (port 22) from your IP
- Make sure the instance is running (EC2 Console → Instances)
- Make sure you're using the right `.pem` key file

### MySQL connection refused?
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Verify the user exists
sudo mysql -e "SELECT User, Host FROM mysql.user;"
```

### Out of memory (t2.micro has only 1 GB RAM)?
Add swap space:
```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Frontend build fails (out of memory)?
```bash
# Set Node memory limit before building
cd /home/ubuntu/ThekeDaari/frontend
NODE_OPTIONS="--max-old-space-size=512" npm run build
```

---

## PART 8: Monthly Cost After Free Tier (12 months)

| Service | Monthly Cost |
|---------|-------------|
| EC2 t2.micro | ~$8.50 (~₹700) |
| EBS 25GB | ~$2.50 (~₹200) |
| Elastic IP | Free (when attached) |
| Data transfer | Free up to 100 GB |
| **Total** | **~₹900/month** |

---

## Quick Reference Card

| Task | Command |
|------|---------|
| SSH into server | `ssh -i ~/.ssh/thekedaar-key.pem ubuntu@YOUR_IP` |
| Check app status | `pm2 status` |
| View logs | `pm2 logs` |
| Restart apps | `pm2 restart all` |
| Deploy updates | `cd ~/ThekeDaari && git pull && ./deploy/deploy.sh` |
| Check MySQL | `mysql -u thekedaar -p thekedaar_db` |
| Server memory | `free -h` |
| Server disk | `df -h` |
