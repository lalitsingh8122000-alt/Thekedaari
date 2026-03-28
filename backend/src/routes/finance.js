const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const {
  VALID_PAYMENT_MODES,
  VALID_EXPENSE_REMARKS,
  normalizeString,
  parseAmount,
  parseId,
  isValidDate,
} = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/projects/:id/income', auth, async (req, res) => {
  try {
    const projectId = parseId(req.params.id);
    if (!projectId) return res.status(400).json({ error: 'Invalid project id' });
    const incomes = await prisma.income.findMany({
      where: { projectId, userId: req.userId },
      orderBy: { date: 'desc' },
    });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/projects/:id/income', auth, async (req, res) => {
  try {
    const amount = parseAmount(req.body.amount);
    const date = req.body.date;
    const paymentMode = normalizeString(req.body.paymentMode);
    const remarks = normalizeString(req.body.remarks);
    const projectId = parseId(req.params.id);

    if (amount === null || !date || !paymentMode) {
      return res.status(400).json({ error: 'Amount, date, and payment mode are required' });
    }
    if (!projectId) return res.status(400).json({ error: 'Invalid project id' });
    if (amount <= 0 || amount > 100000000) {
      return res.status(400).json({ error: 'Amount must be between 1 and 10,00,00,000' });
    }
    if (!isValidDate(date)) return res.status(400).json({ error: 'Invalid date' });
    if (!VALID_PAYMENT_MODES.has(paymentMode)) return res.status(400).json({ error: 'Invalid payment mode' });
    if (remarks.length > 500) return res.status(400).json({ error: 'Remarks cannot exceed 500 characters' });

    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const income = await prisma.income.create({
      data: {
        projectId,
        amount,
        date: new Date(date),
        paymentMode,
        remarks: remarks || null,
        userId: req.userId,
      },
    });

    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/projects/:id/expenses', auth, async (req, res) => {
  try {
    const projectId = parseId(req.params.id);
    if (!projectId) return res.status(400).json({ error: 'Invalid project id' });
    const expenses = await prisma.expense.findMany({
      where: { projectId, userId: req.userId },
      orderBy: { date: 'desc' },
      include: {
        worker: { select: { id: true, name: true, phone: true, role: { select: { name: true } } } },
      },
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/projects/:id/expenses', auth, async (req, res) => {
  try {
    const amount = parseAmount(req.body.amount);
    const remarks = normalizeString(req.body.remarks);
    const notes = normalizeString(req.body.notes);
    const workerId = req.body.workerId !== undefined && req.body.workerId !== null ? parseId(req.body.workerId) : null;
    const date = req.body.date;
    const projectId = parseId(req.params.id);

    if (amount === null || !remarks) {
      return res.status(400).json({ error: 'Amount and remarks are required' });
    }
    if (!projectId) return res.status(400).json({ error: 'Invalid project id' });
    if (amount <= 0 || amount > 100000000) {
      return res.status(400).json({ error: 'Amount must be between 1 and 10,00,00,000' });
    }
    if (!VALID_EXPENSE_REMARKS.has(remarks)) return res.status(400).json({ error: 'Invalid expense category' });
    if (notes.length > 2000) return res.status(400).json({ error: 'Notes cannot exceed 2000 characters' });
    if (date !== undefined && date !== null && date !== '' && !isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid expense date' });
    }
    if (req.body.workerId !== undefined && req.body.workerId !== null && !workerId) {
      return res.status(400).json({ error: 'Invalid worker' });
    }

    if (remarks === 'Labour' && !workerId) {
      return res.status(400).json({ error: 'Please select a worker for labour expense' });
    }
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (workerId) {
      const worker = await prisma.worker.findFirst({ where: { id: workerId, userId: req.userId } });
      if (!worker) return res.status(404).json({ error: 'Worker not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          projectId,
          amount,
          remarks,
          notes: notes || null,
          workerId: workerId || null,
          date: date ? new Date(date) : new Date(),
          userId: req.userId,
        },
        include: {
          worker: { select: { id: true, name: true } },
        },
      });

      if (workerId) {
        await tx.ledgerEntry.create({
          data: {
            workerId,
            amount,
            type: 'Debit',
            category: 'Payment',
            remarks: `Payment - ${remarks}${notes ? ' - ' + notes : ''}`,
            userId: req.userId,
          },
        });
      }

      return expense;
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/projects/:id/summary', auth, async (req, res) => {
  try {
    const projectId = parseId(req.params.id);
    if (!projectId) return res.status(400).json({ error: 'Invalid project id' });

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const incomes = await prisma.income.aggregate({
      where: { projectId, userId: req.userId },
      _sum: { amount: true },
    });

    const materialExpenses = await prisma.expense.aggregate({
      where: { projectId, userId: req.userId, remarks: { not: 'Labour' } },
      _sum: { amount: true },
    });

    const labourPayments = await prisma.expense.aggregate({
      where: { projectId, userId: req.userId, remarks: 'Labour' },
      _sum: { amount: true },
    });

    const totalIncome = incomes._sum.amount || 0;
    const materialExpense = materialExpenses._sum.amount || 0;
    const labourCost = labourPayments._sum.amount || 0;
    const totalExpense = materialExpense + labourCost;
    const profitLoss = totalIncome - totalExpense;

    res.json({
      project,
      totalIncome,
      totalMaterialExpense: materialExpense,
      totalLabourCost: labourCost,
      totalExpense,
      profitLoss,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
