# Thekedaar - ठेकेदार

### Construction Workforce & Project Management System

A Progressive Web Application (PWA) for construction contractors (thekedaar) to manage workers, daily attendance, salary payments, project finances, and ledger — all from a mobile phone.

---

## Features

| Module | Description |
|--------|-------------|
| **Hindi / English Toggle** | Switch language from navbar — designed for workers who prefer Hindi |
| **Mobile-First PWA** | Installable on phone, works like a native app, simple 1-2 tap UI |
| **Worker Management** | Add workers with photo, role (Labour/Karigar/Supervisor), daily rate |
| **Attendance System** | Mark P (Present) / A (Absent), Full Day / Half Day, editable salary per day |
| **On-the-Spot Payment** | Pay workers during attendance with payment note (e.g., "for medicine") |
| **Ledger System** | OkCredit-style per-worker Credit / Debit / Running Balance |
| **Project Management** | Track projects with type (Small/Medium/Big) and status (Running/Completed) |
| **Project Finance** | Income & expense tracking per project with profit/loss summary |
| **Labour Expense Linking** | Link labour expenses to specific workers, auto-update their ledger |
| **Dashboard** | Real-time overview — today's attendance, expenses, profit/loss |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (React 18) |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Backend | Node.js + Express 4 |
| Database | **MySQL 8+** |
| ORM | Prisma 5 |
| Auth | JWT (30-day tokens) + bcryptjs |
| File Upload | Multer |

---

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

| Software | Version | Check Command | Download Link |
|----------|---------|---------------|---------------|
| **Node.js** | 18+ | `node --version` | https://nodejs.org/ |
| **npm** | 9+ | `npm --version` | Comes with Node.js |
| **MySQL** | 8.0+ | `mysql --version` | https://dev.mysql.com/downloads/ |

### Installing Prerequisites

**macOS (using Homebrew):**

```bash
# Install Node.js
brew install node

# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql
```

**Windows:**

1. Download and install Node.js from https://nodejs.org/ (LTS version)
2. Download and install MySQL from https://dev.mysql.com/downloads/installer/
3. During MySQL installation, set a root password (remember it!)

**Linux (Ubuntu/Debian):**

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

---

## Setup Guide (Step by Step)

### Step 1: Extract the ZIP files

Extract both `frontend.zip` and `backend.zip` into a folder. Your structure should look like:

```
thekedaar/
├── backend/
└── frontend/
```

---

### Step 2: Setup MySQL Database

Open a terminal and connect to MySQL:

```bash
mysql -u root -p
```

Enter your MySQL root password when prompted. Then run:

```sql
CREATE DATABASE thekedaar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Type `exit` to quit MySQL.

> **Note:** The `utf8mb4` charset supports Hindi text storage.

---

### Step 3: Setup Backend

Open a terminal in the `backend` folder:

```bash
cd backend
```

#### 3.1 Install Dependencies

```bash
npm install
```

#### 3.2 Configure Environment Variables

Create a file named `.env` in the `backend` folder (or edit the existing one):

```env
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/thekedaar_db"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=5000
```

> **IMPORTANT:** Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL root password.
>
> **Example:** If your MySQL password is `Admin@123`, the URL becomes:
> ```
> DATABASE_URL="mysql://root:Admin@123@localhost:3306/thekedaar_db"
> ```
>
> If your MySQL has NO password (fresh install on macOS):
> ```
> DATABASE_URL="mysql://root@localhost:3306/thekedaar_db"
> ```

#### 3.3 Create Database Tables

```bash
npx prisma db push
```

You should see:

```
🚀  Your database is now in sync with your Prisma schema. Done in XXXms
✔ Generated Prisma Client
```

#### 3.4 Start the Backend Server

```bash
npm run dev
```

You should see:

```
Server running on port 5000
```

> **Keep this terminal open.** The backend needs to keep running.

#### 3.5 Verify Backend is Working

Open a new terminal and run:

```bash
curl http://localhost:5000/api/health
```

You should see:

```json
{"status":"ok","message":"Thekedaar API is running"}
```

---

### Step 4: Setup Frontend

Open a **new terminal** in the `frontend` folder:

```bash
cd frontend
```

#### 4.1 Install Dependencies

```bash
npm install
```

#### 4.2 Configure API URL (Optional)

The frontend connects to `http://localhost:5000/api` by default. If your backend runs on a different port or server, create a `.env.local` file in the `frontend` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### 4.3 Start the Frontend

```bash
npm run dev
```

You should see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

---

### Step 5: Open the Application

1. Open your browser and go to: **http://localhost:3000**
2. You will see the **Register** page
3. Create your account:
   - Enter your **Name**
   - Enter your **Phone Number** (10+ digits)
   - Enter a **Password**
   - Confirm the password
   - Click **Register**
4. You will be redirected to the **Dashboard**
5. Start using the app!

---

## Quick Start (Summary)

If you're experienced and want the short version:

```bash
# Terminal 1: Backend
cd backend
npm install
# Edit .env → set your MySQL DATABASE_URL
npx prisma db push
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** → Register → Start using.

---

## Project Structure

```
├── backend/
│   ├── .env                       # Environment variables (DB, JWT, Port)
│   ├── package.json               # Backend dependencies
│   ├── db-setup.sql               # MySQL database creation script
│   ├── prisma/
│   │   └── schema.prisma          # Database schema (8 tables)
│   ├── src/
│   │   ├── index.js               # Express server entry point
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT authentication middleware
│   │   └── routes/
│   │       ├── auth.js            # Register / Login / Me
│   │       ├── projects.js        # CRUD projects
│   │       ├── roles.js           # CRUD roles (Labour, Karigar, etc.)
│   │       ├── workers.js         # CRUD workers + photo upload
│   │       ├── attendance.js      # Mark / edit attendance + payment
│   │       ├── ledger.js          # Worker ledger (Credit/Debit)
│   │       ├── finance.js         # Project income & expenses
│   │       └── dashboard.js       # Dashboard metrics
│   └── uploads/                   # Worker photos stored here
│
├── frontend/
│   ├── package.json               # Frontend dependencies
│   ├── next.config.mjs            # Next.js configuration
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   ├── postcss.config.js          # PostCSS configuration
│   ├── public/
│   │   └── manifest.json          # PWA manifest
│   └── src/
│       ├── app/
│       │   ├── layout.js          # Root layout with PWA meta tags
│       │   ├── page.js            # Root redirect
│       │   ├── globals.css        # Global styles + Tailwind
│       │   ├── login/page.js      # Login page
│       │   ├── register/page.js   # Registration page
│       │   ├── dashboard/page.js  # Dashboard with metrics
│       │   ├── projects/          # Project list, add, edit, finance
│       │   ├── workers/           # Worker list, add, edit, ledger
│       │   ├── roles/page.js      # Roles management
│       │   ├── attendance/page.js # Daily attendance with P/A + payment
│       │   └── transactions/      # Daily transactions view
│       ├── components/
│       │   ├── AppShell.jsx       # Auth wrapper with nav components
│       │   ├── Navbar.jsx         # Top bar with language toggle
│       │   ├── BottomNav.jsx      # Mobile bottom navigation
│       │   ├── Sidebar.jsx        # Slide-out menu
│       │   └── Providers.jsx      # Context providers wrapper
│       ├── contexts/
│       │   ├── AuthContext.jsx     # Login/Register/Logout state
│       │   └── LanguageContext.jsx # Hindi/English i18n
│       ├── lib/
│       │   └── api.js             # Axios API client with interceptors
│       └── locales/
│           ├── en.json            # English translations
│           └── hi.json            # Hindi translations
```

---

## Database Schema (MySQL)

The application uses 8 tables:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **User** | Thekedaar accounts | name, phone (unique), password |
| **Project** | Construction projects | name, startDate, endDate, type, status |
| **Role** | Worker roles | name (Labour, Karigar, Supervisor, etc.) |
| **Worker** | Employee registry | name, phone, photo, costPerDay, roleId |
| **Attendance** | Daily attendance | workerId, projectId, date, type (FullDay/HalfDay/Absent), salary |
| **LedgerEntry** | Credit/Debit records | workerId, amount, type (Credit/Debit), category, remarks |
| **Income** | Project income | projectId, amount, date, paymentMode |
| **Expense** | Project expenses | projectId, amount, remarks, workerId (for labour) |

### Entity Relationship

```
User ──┬── Project ──┬── Attendance ── LedgerEntry (Salary)
       │             ├── Income
       │             └── Expense ── Worker (optional)
       ├── Role ── Worker ──┬── Attendance
       │                    ├── LedgerEntry
       │                    └── Expense
       └── Worker
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login (returns JWT) | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | List projects (filter by status) | Yes |
| POST | `/api/projects` | Create project | Yes |
| PUT | `/api/projects/:id` | Update project | Yes |

### Roles

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/roles` | List roles | Yes |
| POST | `/api/roles` | Create role | Yes |

### Workers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/workers` | List workers (filter by status) | Yes |
| POST | `/api/workers` | Create worker (with photo) | Yes |
| PUT | `/api/workers/:id` | Update worker | Yes |

### Attendance

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/attendance` | List attendance (filter by date, worker, project) | Yes |
| POST | `/api/attendance` | Mark attendance + optional payment | Yes |
| PUT | `/api/attendance/:id` | Edit attendance | Yes |

### Ledger

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/ledger/:workerId` | Worker ledger entries + balance | Yes |
| POST | `/api/ledger` | Add manual credit/debit entry | Yes |

### Project Finance

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/finance/projects/:id/income` | List project income | Yes |
| POST | `/api/finance/projects/:id/income` | Add income | Yes |
| GET | `/api/finance/projects/:id/expenses` | List project expenses | Yes |
| POST | `/api/finance/projects/:id/expenses` | Add expense | Yes |
| GET | `/api/finance/projects/:id/summary` | Project financial summary | Yes |

### Dashboard

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard` | All dashboard metrics | Yes |

---

## How the App Works (User Guide)

### First Time Setup

1. **Register** — Enter name, phone, password
2. **Add Roles** — Go to Roles → add "Labour", "Karigar", "Supervisor" (quick-add buttons available)
3. **Add Workers** — Go to Workers → add all your workers with their daily rate
4. **Add Project** — Go to Projects → create your construction project

### Daily Usage

1. **Open Attendance** page
2. Select your **Project** and today's **Date**
3. **Tap on each worker** → a detailed modal opens:
   - Tap **P** (Present) or **A** (Absent)
   - If Present → choose Full Day / Half Day
   - Salary auto-calculates (editable if needed)
   - Toggle **"Pay Money?"** if giving cash → enter amount + reason
   - Tap **Save**
4. The worker's **ledger** auto-updates with salary (Credit) and payment (Debit)

### Checking Finances

- **Worker Ledger** — Workers page → tap Ledger → see all credits/debits/balance
- **Project Finance** — Projects page → tap Finance → see income/expenses/profit

---

## Troubleshooting

### "Cannot connect to MySQL" or "Access denied"

- Make sure MySQL is running: `brew services list` (macOS) or `sudo systemctl status mysql` (Linux)
- Check your `.env` file — is the password correct?
- Test MySQL connection: `mysql -u root -p`

### "EADDRINUSE: address already in use :::5000"

Another process is using port 5000. Kill it:

```bash
# macOS / Linux
lsof -ti:5000 | xargs kill -9

# Then start again
npm run dev
```

### "Prisma db push fails"

- Make sure MySQL is running and the database exists
- Verify the `DATABASE_URL` in `.env` is correct
- Try: `npx prisma generate` first, then `npx prisma db push`

### "Frontend shows blank page / API errors"

- Make sure the backend is running on port 5000
- Check browser console for errors (F12 → Console tab)
- Make sure both terminals (frontend + backend) are running

### "Session expires / Auto logout"

- JWT tokens are valid for **30 days**
- If you clear browser data (localStorage), you'll need to login again

---

## Useful Commands

```bash
# View database tables in browser
cd backend && npx prisma studio

# Reset database (delete all data + recreate tables)
cd backend && npx prisma db push --force-reset

# Build frontend for production
cd frontend && npm run build && npm start

# Check MySQL database directly
mysql -u root -p thekedaar_db -e "SHOW TABLES;"
```

---

## Default Ports

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Prisma Studio | http://localhost:5555 |

---

## License

This project is built for **Thekedaar Management** purposes. Use freely for personal or commercial construction management.
# THEKEDAARI-1.0
# THEKEDAARI-1.0
# THEKEDAARI-1.0
# THEKEDAARI-1.0
#   T h e k e d a a r i  
 