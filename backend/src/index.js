require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const dbTarget = (process.env.DB_TARGET || 'local').toLowerCase();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    dbTarget === 'aws' ? process.env.DATABASE_URL_AWS : process.env.DATABASE_URL_LOCAL;
}

const { PrismaClient } = require('@prisma/client');
const auth = require('./middleware/auth');
const requireSubscription = require('./middleware/requireSubscription');
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');
const projectRoutes = require('./routes/projects');
const roleRoutes = require('./routes/roles');
const contractTradeRoutes = require('./routes/contractTrades');
const workerRoutes = require('./routes/workers');
const attendanceRoutes = require('./routes/attendance');
const ledgerRoutes = require('./routes/ledger');
const financeRoutes = require('./routes/finance');
const dashboardRoutes = require('./routes/dashboard');
const blogRoutes = require('./routes/blogs');
const vendorRoutes = require('./routes/vendors');
const vendorLedgerRoutes = require('./routes/vendorLedger');
const transactionRoutes = require('./routes/transactions');

const prismaHealth = new PrismaClient();

const app = express();
app.disable('etag');
// 🚀 paste here
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(
  express.json({
    // Razorpay signs the exact bytes it sends, so the webhook needs the untouched body.
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith('/api/subscription/webhook')) {
        req.rawBody = buf;
      }
    },
  })
);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Open endpoints: sign-up/login, buying a plan, and public marketing content.
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/blogs', blogRoutes);

// Everything below needs a logged-in user with a live subscription.
// `auth` is idempotent, so the auth call inside each router is a no-op second pass.
const paidRoutes = [auth, requireSubscription];
app.use('/api/projects', paidRoutes, projectRoutes);
app.use('/api/roles', paidRoutes, roleRoutes);
app.use('/api/contract-trades', paidRoutes, contractTradeRoutes);
app.use('/api/workers', paidRoutes, workerRoutes);
app.use('/api/attendance', paidRoutes, attendanceRoutes);
app.use('/api/ledger', paidRoutes, ledgerRoutes);
app.use('/api/finance', paidRoutes, financeRoutes);
app.use('/api/dashboard', paidRoutes, dashboardRoutes);
app.use('/api/vendors', paidRoutes, vendorRoutes);
app.use('/api/vendor-ledger', paidRoutes, vendorLedgerRoutes);
app.use('/api/transactions', paidRoutes, transactionRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await prismaHealth.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'up', message: 'Thekedaar API is running' });
  } catch (e) {
    console.error('[health] database unreachable:', e.message);
    res.status(503).json({
      status: 'unhealthy',
      database: 'down',
      message: 'API is running but cannot connect to MySQL. Start the DB or fix DATABASE_URL.',
      ...(process.env.NODE_ENV !== 'production' && e.message && { detail: e.message }),
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
