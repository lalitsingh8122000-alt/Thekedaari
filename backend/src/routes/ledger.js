const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const {
  VALID_LEDGER_TYPES,
  VALID_LEDGER_CATEGORIES,
  normalizeString,
  parseAmount,
  parseId,
  isValidDate,
} = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:workerId', auth, async (req, res) => {
  try {
    const workerId = parseId(req.params.workerId);
    if (!workerId) return res.status(400).json({ error: 'Invalid worker id' });

    const worker = await prisma.worker.findFirst({
      where: { id: workerId, userId: req.userId },
      select: { id: true, name: true, phone: true, costPerDay: true, status: true },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const entries = await prisma.ledgerEntry.findMany({
      where: { workerId, userId: req.userId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: {
        attendance: { select: { date: true, type: true, project: { select: { name: true } } } },
      },
    });

    let balance = 0;
    const ledger = entries.map((entry) => {
      if (entry.type === 'Credit') {
        balance += entry.amount;
      } else {
        balance -= entry.amount;
      }
      return { ...entry, runningBalance: balance };
    });

    res.json({ worker, ledger: ledger.reverse(), currentBalance: balance });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const workerId = parseId(req.body.workerId);
    const amount = parseAmount(req.body.amount);
    const type = normalizeString(req.body.type);
    const category = normalizeString(req.body.category);
    const remarks = normalizeString(req.body.remarks);
    const comment = normalizeString(req.body.comment);
    const projectId = parseId(req.body.projectId);
    const expenseDateRaw = req.body.date;

    if (!workerId || amount === null || !type || !category) {
      return res.status(400).json({ error: 'Worker, amount, type, and category are required' });
    }
    if (!VALID_LEDGER_TYPES.has(type)) return res.status(400).json({ error: 'Invalid ledger type' });
    if (!VALID_LEDGER_CATEGORIES.has(category)) return res.status(400).json({ error: 'Invalid ledger category' });
    if (amount <= 0 || amount > 100000000) {
      return res.status(400).json({ error: 'Amount must be between 1 and 10,00,00,000' });
    }
    if (remarks.length > 500) return res.status(400).json({ error: 'Remarks cannot exceed 500 characters' });
    if (comment.length > 2000) return res.status(400).json({ error: 'Comment cannot exceed 2000 characters' });

    const worker = await prisma.worker.findFirst({
      where: { id: workerId, userId: req.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const isPaymentToWorker = type === 'Debit' && category === 'Payment';
    if (isPaymentToWorker) {
      if (!projectId) {
        return res.status(400).json({ error: 'Select a project so this payment is counted in that project’s labour expense' });
      }
      const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (expenseDateRaw !== undefined && expenseDateRaw !== null && expenseDateRaw !== '' && !isValidDate(expenseDateRaw)) {
        return res.status(400).json({ error: 'Invalid expense date' });
      }
    }

    const expenseDate =
      isPaymentToWorker && expenseDateRaw && isValidDate(expenseDateRaw)
        ? new Date(expenseDateRaw)
        : new Date();

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.ledgerEntry.create({
        data: {
          workerId,
          amount,
          type,
          category,
          remarks: remarks || null,
          comment: comment || null,
          userId: req.userId,
        },
      });

      if (isPaymentToWorker) {
        const noteParts = ['Worker ledger payment'];
        if (remarks) noteParts.push(remarks);
        if (comment) noteParts.push(comment);
        await tx.expense.create({
          data: {
            projectId,
            amount,
            remarks: 'Labour',
            notes: noteParts.join(' — '),
            workerId,
            date: expenseDate,
            userId: req.userId,
          },
        });
      }

      return created;
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
