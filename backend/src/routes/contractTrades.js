const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { sendServerError } = require('../utils/serverError');
const { normalizeString, parseId } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const trades = await prisma.contractTrade.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { workers: true, expenses: true } } },
    });
    res.json(trades);
  } catch (err) {
    sendServerError(res, err, 'contractTrades GET');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const name = normalizeString(req.body.name);
    if (!name) return res.status(400).json({ error: 'Trade name is required' });
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Trade name must be between 2 and 100 characters' });
    }

    const trade = await prisma.contractTrade.create({
      data: { name, userId: req.userId },
    });
    res.status(201).json(trade);
  } catch (err) {
    sendServerError(res, err, 'contractTrades POST');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });

    const trade = await prisma.contractTrade.findFirst({
      where: { id, userId: req.userId },
      include: { _count: { select: { workers: true, expenses: true } } },
    });
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    if (trade._count.workers > 0 || trade._count.expenses > 0) {
      return res.status(409).json({
        error: 'This trade is in use by workers or expenses. Reassign workers before deleting.',
      });
    }

    await prisma.contractTrade.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    sendServerError(res, err, 'contractTrades DELETE');
  }
});

module.exports = router;
