const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { sendServerError } = require('../utils/serverError');
const { isValidDate } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/transactions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    const dateCond = {};
    if (startDate) {
      if (!isValidDate(startDate)) return res.status(400).json({ error: 'Invalid startDate' });
      dateCond.gte = new Date(startDate);
    }
    if (endDate) {
      if (!isValidDate(endDate)) return res.status(400).json({ error: 'Invalid endDate' });
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateCond.lte = end;
    }

    const dateFilter = Object.keys(dateCond).length ? { date: dateCond } : {};
    const createdFilter = Object.keys(dateCond).length ? { createdAt: dateCond } : {};

    // 1. Attendance payment ledger entries (actual cash paid to workers during attendance)
    const attPayments = await prisma.ledgerEntry.findMany({
      where: { userId, category: 'Payment', remarks: { contains: 'att:' }, ...createdFilter },
      include: {
        worker: { select: { id: true, name: true } },
        attendance: { select: { id: true, date: true, project: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Manual ledger entries — only actual cash movements (Debit = paid out to worker, Credit = bonus paid in cash)
    //    Skip: notional salary credits, notional contract credits, attendance-payment entries, overtime entries
    const manualLedger = await prisma.ledgerEntry.findMany({
      where: {
        userId,
        type: 'Debit', // Only actual cash-out movements
        // Exclude notional categories
        NOT: [
          { category: 'Salary' },
          { category: 'Contract' },
        ],
        // Exclude attendance-linked payment entries (already captured in attPayments)
        // Handle NULL remarks explicitly — NULL does not match LIKE '%att:%' in SQL,
        // so we must use OR to correctly include NULL-remarks entries.
        OR: [
          { remarks: null },
          { remarks: { not: { contains: 'att:' } } },
        ],
        ...createdFilter,
      },
      include: { worker: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Project expenses — skip Labour (those are notional attendance wage lines)
    const expenses = await prisma.expense.findMany({
      where: { userId, remarks: { not: 'Labour' }, ...dateFilter },
      include: {
        project: { select: { id: true, name: true } },
        worker: { select: { id: true, name: true } },
        contractTrade: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    // 4. Project income
    const income = await prisma.income.findMany({
      where: { userId, ...dateFilter },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });

    // 5. Vendor ledger entries
    const vendorEntries = await prisma.vendorLedgerEntry.findMany({
      where: { userId, ...createdFilter },
      include: { vendor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // --- Normalize into unified list ---
    const entries = [];

    attPayments.forEach((e) => {
      const noteMatch = e.remarks?.match(/\| (.+)$/);
      entries.push({
        id: `ap-${e.id}`,
        type: 'worker_payment',
        direction: 'out',
        amount: e.amount,
        date: e.attendance?.date || e.createdAt,
        label: e.worker?.name || 'Worker',
        sublabel: e.attendance?.project?.name || '',
        note: noteMatch ? noteMatch[1] : '',
        category: 'Worker Payment',
        icon: 'worker',
      });
    });

    manualLedger.forEach((e) => {
      const isOut = e.type === 'Debit';
      entries.push({
        id: `ml-${e.id}`,
        type: 'manual_ledger',
        direction: isOut ? 'out' : 'in',
        amount: e.amount,
        date: e.createdAt,
        label: e.worker?.name || 'Worker',
        sublabel: e.category,
        note: e.remarks || e.comment || '',
        category: e.category,
        icon: 'worker',
      });
    });

    expenses.forEach((e) => {
      entries.push({
        id: `ex-${e.id}`,
        type: 'expense',
        direction: 'out',
        amount: e.amount,
        date: e.date,
        label: e.remarks || 'Expense',
        sublabel: e.project?.name || '',
        note: e.notes || '',
        category: 'Expense',
        icon: 'expense',
      });
    });

    income.forEach((e) => {
      entries.push({
        id: `in-${e.id}`,
        type: 'income',
        direction: 'in',
        amount: e.amount,
        date: e.date,
        label: e.project?.name || 'Project',
        sublabel: e.paymentMode || '',
        note: e.remarks || '',
        category: 'Income',
        icon: 'income',
      });
    });

    vendorEntries.forEach((e) => {
      const isOut = e.type === 'Debit';
      entries.push({
        id: `vl-${e.id}`,
        type: 'vendor',
        direction: isOut ? 'out' : 'in',
        amount: e.amount,
        date: e.createdAt,
        label: e.vendor?.name || 'Vendor',
        sublabel: isOut ? `Payment — ${e.category}` : `Bill — ${e.category}`,
        note: e.remarks || '',
        category: 'Vendor',
        icon: 'vendor',
      });
    });

    // Sort by date descending
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalOut = entries.filter((e) => e.direction === 'out').reduce((s, e) => s + e.amount, 0);
    const totalIn = entries.filter((e) => e.direction === 'in').reduce((s, e) => s + e.amount, 0);

    res.json({ entries, totalOut, totalIn, count: entries.length });
  } catch (err) {
    sendServerError(res, err, 'transactions');
  }
});

module.exports = router;
