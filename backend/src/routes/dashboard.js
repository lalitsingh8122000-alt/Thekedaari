const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;

    const totalIncome = await prisma.income.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const totalMaterialExpense = await prisma.expense.aggregate({
      where: { userId, remarks: { notIn: ['Labour', 'Contract'] } },
      _sum: { amount: true },
    });

    const totalLabourPayments = await prisma.expense.aggregate({
      where: { userId, remarks: 'Labour' },
      _sum: { amount: true },
    });

    const totalContractExpenseAgg = await prisma.expense.aggregate({
      where: { userId, remarks: 'Contract' },
      _sum: { amount: true },
    });

    const income = totalIncome._sum.amount || 0;
    const materialExpense = totalMaterialExpense._sum.amount || 0;
    const labourCost = totalLabourPayments._sum.amount || 0;
    const contractExpense = totalContractExpenseAgg._sum.amount || 0;
    const totalExpense = materialExpense + labourCost + contractExpense;

    // Build today's date in IST (UTC+5:30) — attendance is saved as `YYYY-MM-DDT00:00:00.000Z`
    // so we need the IST calendar date, then construct the same UTC-midnight boundaries.
    const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000); // shift to IST
    const yy = nowIST.getUTCFullYear();
    const mm = String(nowIST.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(nowIST.getUTCDate()).padStart(2, '0');
    const todayISO = `${yy}-${mm}-${dd}`;
    const today = new Date(`${todayISO}T00:00:00.000Z`);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const todayAttendanceRows = await prisma.attendance.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      select: { workerId: true, type: true },
    });

    /** Per worker: absent wins if any row is Absent (split half-days produce multiple non-absent rows). */
    const workerDay = new Map();
    for (const row of todayAttendanceRows) {
      const cur = workerDay.get(row.workerId) ?? { absent: false, present: false };
      if (row.type === 'Absent') cur.absent = true;
      else cur.present = true;
      workerDay.set(row.workerId, cur);
    }
    let todayPresent = 0;
    let todayAbsent = 0;
    for (const v of workerDay.values()) {
      if (v.absent) todayAbsent += 1;
      else if (v.present) todayPresent += 1;
    }
    const todayAttendance = todayAttendanceRows.length;

    const todayExpense = await prisma.expense.aggregate({
      where: { userId, date: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    });

    const activeProjects = await prisma.project.count({
      where: { userId, status: 'Running' },
    });

    const activeWorkers = await prisma.worker.count({
      where: { userId, status: 'Active' },
    });

    const topProjects = await prisma.project.findMany({
      where: { userId, status: 'Running' },
      take: 5,
      include: {
        expenses: { select: { amount: true } },
        incomes: { select: { amount: true } },
      },
    });

    const topProjectData = topProjects.map((p) => ({
      id: p.id,
      name: p.name,
      totalExpense: p.expenses.reduce((sum, e) => sum + e.amount, 0),
      totalIncome: p.incomes.reduce((sum, i) => sum + i.amount, 0),
    }));

    /**
     * Recent list: only money paid to workers (ledger Debits: Payment / Other).
     * Add earning / salary / bonus = Credit — must never appear here.
     * Fetch recent rows then filter in JS so stray Credits never slip through.
     */
    const ledgerRecentRaw = await prisma.ledgerEntry.findMany({
      where: { userId },
      take: 80,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { worker: { select: { name: true } } },
    });
    const recentPayments = ledgerRecentRaw
      .filter((e) => {
        const typ = String(e.type ?? '').trim();
        const cat = String(e.category ?? '').trim();
        return typ === 'Debit' && (cat === 'Payment' || cat === 'Other');
      })
      .slice(0, 20);

    const recentIncomes = await prisma.income.findMany({
      where: { userId },
      take: 20,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { project: { select: { name: true } } },
    });

    const ledgerLabel = (tx) => {
      const cat = tx.category || '';
      const rem = tx.remarks != null && String(tx.remarks).trim() ? String(tx.remarks).trim() : '';
      return rem ? `${cat} · ${rem}` : cat;
    };

    const recentTransactions = [
      ...recentPayments.map((tx) => ({
        id: `ledger-${tx.id}`,
        source: 'payment',
        name: tx.worker?.name || '',
        label: ledgerLabel(tx),
        amount: tx.amount,
        type: 'Debit',
        createdAt: tx.createdAt,
      })),
      ...recentIncomes.map((inc) => ({
        id: `income-${inc.id}`,
        source: 'income',
        name: inc.project?.name || '',
        label: `Income${inc.remarks ? ' · ' + inc.remarks : ''} · ${inc.paymentMode}`,
        amount: inc.amount,
        type: 'Credit',
        createdAt: inc.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    res.json({
      totalIncome: income,
      totalExpense,
      totalMaterialExpense: materialExpense,
      totalLabourCost: labourCost,
      totalContractExpense: contractExpense,
      profitLoss: income - totalExpense,
      todayAttendance,
      todayPresent,
      todayAbsent,
      todayExpense: todayExpense._sum.amount || 0,
      activeProjects,
      activeWorkers,
      topProjects: topProjectData,
      recentTransactions,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
