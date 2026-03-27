const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:workerId', auth, async (req, res) => {
  try {
    const workerId = parseInt(req.params.workerId);

    const worker = await prisma.worker.findFirst({
      where: { id: workerId, userId: req.userId },
      select: { id: true, name: true, phone: true, costPerDay: true, status: true },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const entries = await prisma.ledgerEntry.findMany({
      where: { workerId, userId: req.userId },
      orderBy: { createdAt: 'asc' },
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
    const { workerId, amount, type, category, remarks, comment } = req.body;

    if (!workerId || !amount || !type || !category) {
      return res.status(400).json({ error: 'Worker, amount, type, and category are required' });
    }

    const worker = await prisma.worker.findFirst({
      where: { id: parseInt(workerId), userId: req.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const entry = await prisma.ledgerEntry.create({
      data: {
        workerId: parseInt(workerId),
        amount: parseFloat(amount),
        type,
        category,
        remarks: remarks || null,
        comment: comment || null,
        userId: req.userId,
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
