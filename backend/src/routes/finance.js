const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/projects/:id/income', auth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
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
    const { amount, date, paymentMode, remarks } = req.body;
    const projectId = parseInt(req.params.id);

    if (!amount || !date || !paymentMode) {
      return res.status(400).json({ error: 'Amount, date, and payment mode are required' });
    }

    const income = await prisma.income.create({
      data: {
        projectId,
        amount: parseFloat(amount),
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
    const projectId = parseInt(req.params.id);
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
    const { amount, remarks, notes, workerId, date } = req.body;
    const projectId = parseInt(req.params.id);

    if (!amount || !remarks) {
      return res.status(400).json({ error: 'Amount and remarks are required' });
    }

    if (remarks === 'Labour' && !workerId) {
      return res.status(400).json({ error: 'Please select a worker for labour expense' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          projectId,
          amount: parseFloat(amount),
          remarks,
          notes: notes || null,
          workerId: workerId ? parseInt(workerId) : null,
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
            workerId: parseInt(workerId),
            amount: parseFloat(amount),
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
    const projectId = parseInt(req.params.id);

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const incomes = await prisma.income.aggregate({
      where: { projectId, userId: req.userId },
      _sum: { amount: true },
    });

    const expenses = await prisma.expense.aggregate({
      where: { projectId, userId: req.userId },
      _sum: { amount: true },
    });

    const labourCost = await prisma.attendance.aggregate({
      where: { projectId, userId: req.userId },
      _sum: { salary: true },
    });

    const totalIncome = incomes._sum.amount || 0;
    const totalExpense = (expenses._sum.amount || 0) + (labourCost._sum.salary || 0);
    const profitLoss = totalIncome - totalExpense;

    res.json({
      project,
      totalIncome,
      totalMaterialExpense: expenses._sum.amount || 0,
      totalLabourCost: labourCost._sum.salary || 0,
      totalExpense,
      profitLoss,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
