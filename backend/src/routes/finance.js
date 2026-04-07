const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { sendServerError } = require('../utils/serverError');
const {
  VALID_PAYMENT_MODES,
  VALID_EXPENSE_REMARKS,
  normalizeString,
  parseAmount,
  parseId,
  isValidDate,
  roleNameIsContractor,
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
    sendServerError(res, err, 'finance');
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
    sendServerError(res, err, 'finance');
  }
});

router.get('/projects/:id/expenses', auth, async (req, res) => {
  try {
    const projectId = parseId(req.params.id);
    if (!projectId) return res.status(400).json({ error: 'Invalid project id' });
    const expenses = await prisma.expense.findMany({
      where: { projectId, userId: req.userId, remarks: { not: 'Labour' } },
      orderBy: { date: 'desc' },
      include: {
        worker: { select: { id: true, name: true, phone: true, workerType: true, role: { select: { name: true } } } },
        contractTrade: { select: { id: true, name: true } },
      },
    });
    res.json(expenses);
  } catch (err) {
    sendServerError(res, err, 'finance');
  }
});

router.post('/projects/:id/expenses', auth, async (req, res) => {
  try {
    const amount = parseAmount(req.body.amount);
    const remarks = normalizeString(req.body.remarks);
    const notes = normalizeString(req.body.notes);
    const workerId = req.body.workerId !== undefined && req.body.workerId !== null ? parseId(req.body.workerId) : null;
    const contractTradeIdBody =
      req.body.contractTradeId !== undefined && req.body.contractTradeId !== null
        ? parseId(req.body.contractTradeId)
        : null;
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
    if (remarks === 'Labour') {
      return res.status(400).json({
        error: 'Labour cost is recorded from attendance. Add cement, sand, or other expenses here.',
      });
    }
    if (remarks === 'Contract') {
      if (!workerId) {
        return res.status(400).json({ error: 'Select a contractor for contract (theka) expense' });
      }
    }
    if (notes.length > 2000) return res.status(400).json({ error: 'Notes cannot exceed 2000 characters' });
    if (date !== undefined && date !== null && date !== '' && !isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid expense date' });
    }
    if (req.body.workerId !== undefined && req.body.workerId !== null && !workerId) {
      return res.status(400).json({ error: 'Invalid worker' });
    }
    if (
      remarks === 'Contract' &&
      req.body.contractTradeId !== undefined &&
      req.body.contractTradeId !== null &&
      req.body.contractTradeId !== '' &&
      !contractTradeIdBody
    ) {
      return res.status(400).json({ error: 'Invalid contract trade' });
    }

    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    let workerRow = null;
    let resolvedTradeId = null;
    if (workerId) {
      workerRow = await prisma.worker.findFirst({
        where: { id: workerId, userId: req.userId },
        include: { role: true },
      });
      if (!workerRow) return res.status(404).json({ error: 'Worker not found' });
    }
    const isContractorPerson =
      workerRow &&
      (workerRow.workerType === 'Contractor' || roleNameIsContractor(workerRow.role?.name));
    if (remarks === 'Contract') {
      if (!isContractorPerson) {
        return res.status(400).json({
          error: 'Contract expense must be for a worker with the Contractor role',
        });
      }
      resolvedTradeId = contractTradeIdBody || workerRow.contractTradeId;
      if (!resolvedTradeId) {
        return res.status(400).json({ error: 'Contract trade is required (set on worker or pass contractTradeId)' });
      }
      const trade = await prisma.contractTrade.findFirst({
        where: { id: resolvedTradeId, userId: req.userId },
      });
      if (!trade) return res.status(404).json({ error: 'Contract trade not found' });
    } else if (workerId && remarks !== 'Contract') {
      // Unchanged: material expense with a linked person records payment in ledger
    }

    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          projectId,
          amount,
          remarks,
          notes: notes || null,
          workerId: workerId || null,
          contractTradeId: remarks === 'Contract' ? resolvedTradeId : null,
          date: date ? new Date(date) : new Date(),
          userId: req.userId,
        },
        include: {
          worker: { select: { id: true, name: true } },
          contractTrade: { select: { id: true, name: true } },
        },
      });

      if (remarks === 'Contract' && workerId) {
        const tradeRow = await tx.contractTrade.findFirst({
          where: { id: resolvedTradeId, userId: req.userId },
        });
        await tx.ledgerEntry.create({
          data: {
            workerId,
            amount,
            type: 'Credit',
            category: 'Contract',
            remarks: `Theka — ${project.name} — ${tradeRow.name}${notes ? ` — ${notes}` : ''}`,
            userId: req.userId,
            expenseId: expense.id,
          },
        });
      } else if (workerId) {
        await tx.ledgerEntry.create({
          data: {
            workerId,
            amount,
            type: 'Debit',
            category: 'Payment',
            remarks: `Payment - ${remarks}${notes ? ' - ' + notes : ''}`,
            userId: req.userId,
            expenseId: expense.id,
          },
        });
      }

      return expense;
    });

    res.status(201).json(result);
  } catch (err) {
    sendServerError(res, err, 'finance');
  }
});

router.patch('/income/:incomeId', auth, async (req, res) => {
  try {
    const incomeId = parseId(req.params.incomeId);
    if (!incomeId) return res.status(400).json({ error: 'Invalid income id' });

    const existing = await prisma.income.findFirst({
      where: { id: incomeId, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Income not found' });

    const amount = parseAmount(req.body.amount);
    const date = req.body.date;
    const paymentMode = normalizeString(req.body.paymentMode);
    const remarks = normalizeString(req.body.remarks);

    if (amount === null || !date || !paymentMode) {
      return res.status(400).json({ error: 'Amount, date, and payment mode are required' });
    }
    if (amount <= 0 || amount > 100000000) {
      return res.status(400).json({ error: 'Amount must be between 1 and 10,00,00,000' });
    }
    if (!isValidDate(date)) return res.status(400).json({ error: 'Invalid date' });
    if (!VALID_PAYMENT_MODES.has(paymentMode)) return res.status(400).json({ error: 'Invalid payment mode' });
    if (remarks.length > 500) return res.status(400).json({ error: 'Remarks cannot exceed 500 characters' });

    const income = await prisma.income.update({
      where: { id: incomeId },
      data: {
        amount,
        date: new Date(date),
        paymentMode,
        remarks: remarks || null,
      },
    });

    res.json(income);
  } catch (err) {
    sendServerError(res, err, 'finance');
  }
});

router.delete('/income/:incomeId', auth, async (req, res) => {
  try {
    const incomeId = parseId(req.params.incomeId);
    if (!incomeId) return res.status(400).json({ error: 'Invalid income id' });

    const result = await prisma.income.deleteMany({
      where: { id: incomeId, userId: req.userId },
    });
    if (result.count === 0) return res.status(404).json({ error: 'Income not found' });
    res.sendStatus(204);
  } catch (err) {
    sendServerError(res, err, 'finance');
  }
});

router.patch('/expenses/:expenseId', auth, async (req, res) => {
  try {
    const expenseId = parseId(req.params.expenseId);
    if (!expenseId) return res.status(400).json({ error: 'Invalid expense id' });

    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, userId: req.userId },
      include: { project: true },
    });
    if (!existing) return res.status(404).json({ error: 'Expense not found' });
    if (existing.remarks === 'Labour') {
      return res.status(400).json({
        error: 'Labour expenses are recorded from attendance and cannot be edited here.',
      });
    }

    const amount = parseAmount(req.body.amount);
    const remarks = normalizeString(req.body.remarks);
    const notes = normalizeString(req.body.notes);
    const workerId = req.body.workerId !== undefined && req.body.workerId !== null ? parseId(req.body.workerId) : null;
    const contractTradeIdBody =
      req.body.contractTradeId !== undefined && req.body.contractTradeId !== null
        ? parseId(req.body.contractTradeId)
        : null;
    const dateRaw = req.body.date;
    const projectId = existing.projectId;
    const project = existing.project;

    let nextExpenseDate = existing.date;
    if (dateRaw !== undefined && dateRaw !== null && dateRaw !== '') {
      if (!isValidDate(dateRaw)) return res.status(400).json({ error: 'Invalid expense date' });
      nextExpenseDate = new Date(dateRaw);
    }

    if (amount === null || !remarks) {
      return res.status(400).json({ error: 'Amount and remarks are required' });
    }
    if (!projectId) return res.status(400).json({ error: 'Invalid project' });
    if (amount <= 0 || amount > 100000000) {
      return res.status(400).json({ error: 'Amount must be between 1 and 10,00,00,000' });
    }
    if (!VALID_EXPENSE_REMARKS.has(remarks)) return res.status(400).json({ error: 'Invalid expense category' });
    if (remarks === 'Labour') {
      return res.status(400).json({
        error: 'Labour cost is recorded from attendance. Add cement, sand, or other expenses here.',
      });
    }
    if (remarks === 'Contract') {
      if (!workerId) {
        return res.status(400).json({ error: 'Select a contractor for contract (theka) expense' });
      }
    }
    if (notes.length > 2000) return res.status(400).json({ error: 'Notes cannot exceed 2000 characters' });
    if (req.body.workerId !== undefined && req.body.workerId !== null && !workerId) {
      return res.status(400).json({ error: 'Invalid worker' });
    }
    if (
      remarks === 'Contract' &&
      req.body.contractTradeId !== undefined &&
      req.body.contractTradeId !== null &&
      req.body.contractTradeId !== '' &&
      !contractTradeIdBody
    ) {
      return res.status(400).json({ error: 'Invalid contract trade' });
    }

    let workerRow = null;
    let resolvedTradeId = null;
    if (workerId) {
      workerRow = await prisma.worker.findFirst({
        where: { id: workerId, userId: req.userId },
        include: { role: true },
      });
      if (!workerRow) return res.status(404).json({ error: 'Worker not found' });
    }
    const isContractorPerson =
      workerRow &&
      (workerRow.workerType === 'Contractor' || roleNameIsContractor(workerRow.role?.name));
    if (remarks === 'Contract') {
      if (!isContractorPerson) {
        return res.status(400).json({
          error: 'Contract expense must be for a worker with the Contractor role',
        });
      }
      resolvedTradeId = contractTradeIdBody || workerRow.contractTradeId;
      if (!resolvedTradeId) {
        return res.status(400).json({ error: 'Contract trade is required (set on worker or pass contractTradeId)' });
      }
      const trade = await prisma.contractTrade.findFirst({
        where: { id: resolvedTradeId, userId: req.userId },
      });
      if (!trade) return res.status(404).json({ error: 'Contract trade not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.ledgerEntry.deleteMany({ where: { expenseId } });

      const expense = await tx.expense.update({
        where: { id: expenseId },
        data: {
          amount,
          remarks,
          notes: notes || null,
          workerId: workerId || null,
          contractTradeId: remarks === 'Contract' ? resolvedTradeId : null,
          date: nextExpenseDate,
        },
        include: {
          worker: { select: { id: true, name: true, phone: true, workerType: true, role: { select: { name: true } } } },
          contractTrade: { select: { id: true, name: true } },
        },
      });

      if (remarks === 'Contract' && workerId) {
        const tradeRow = await tx.contractTrade.findFirst({
          where: { id: resolvedTradeId, userId: req.userId },
        });
        await tx.ledgerEntry.create({
          data: {
            workerId,
            amount,
            type: 'Credit',
            category: 'Contract',
            remarks: `Theka — ${project.name} — ${tradeRow.name}${notes ? ` — ${notes}` : ''}`,
            userId: req.userId,
            expenseId: expense.id,
          },
        });
      } else if (workerId) {
        await tx.ledgerEntry.create({
          data: {
            workerId,
            amount,
            type: 'Debit',
            category: 'Payment',
            remarks: `Payment - ${remarks}${notes ? ' - ' + notes : ''}`,
            userId: req.userId,
            expenseId: expense.id,
          },
        });
      }

      return expense;
    });

    res.json(updated);
  } catch (err) {
    sendServerError(res, err, 'finance');
  }
});

router.delete('/expenses/:expenseId', auth, async (req, res) => {
  try {
    const expenseId = parseId(req.params.expenseId);
    if (!expenseId) return res.status(400).json({ error: 'Invalid expense id' });

    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Expense not found' });
    if (existing.remarks === 'Labour') {
      return res.status(400).json({
        error: 'Labour expenses are recorded from attendance and cannot be deleted here.',
      });
    }

    await prisma.expense.delete({ where: { id: expenseId } });
    res.sendStatus(204);
  } catch (err) {
    sendServerError(res, err, 'finance');
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
      where: {
        projectId,
        userId: req.userId,
        remarks: { notIn: ['Labour', 'Contract'] },
      },
      _sum: { amount: true },
    });

    const labourPayments = await prisma.expense.aggregate({
      where: { projectId, userId: req.userId, remarks: 'Labour' },
      _sum: { amount: true },
    });

    const contractExpenses = await prisma.expense.aggregate({
      where: { projectId, userId: req.userId, remarks: 'Contract' },
      _sum: { amount: true },
    });

    const totalIncome = incomes._sum.amount || 0;
    const materialExpense = materialExpenses._sum.amount || 0;
    const labourCost = labourPayments._sum.amount || 0;
    const totalContractExpense = contractExpenses._sum.amount || 0;
    const totalExpense = materialExpense + labourCost + totalContractExpense;
    const profitLoss = totalIncome - totalExpense;

    res.json({
      project,
      totalIncome,
      totalMaterialExpense: materialExpense,
      totalLabourCost: labourCost,
      totalContractExpense,
      totalExpense,
      profitLoss,
    });
  } catch (err) {
    sendServerError(res, err, 'finance');
  }
});

module.exports = router;
