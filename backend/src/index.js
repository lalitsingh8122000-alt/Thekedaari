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
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const roleRoutes = require('./routes/roles');
const contractTradeRoutes = require('./routes/contractTrades');
const workerRoutes = require('./routes/workers');
const attendanceRoutes = require('./routes/attendance');
const ledgerRoutes = require('./routes/ledger');
const financeRoutes = require('./routes/finance');
const dashboardRoutes = require('./routes/dashboard');
const blogRoutes = require('./routes/blogs');

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
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/contract-trades', contractTradeRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/blogs', blogRoutes);

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
