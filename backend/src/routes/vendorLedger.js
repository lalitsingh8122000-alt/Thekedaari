const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { sendServerError } = require('../utils/serverError');
const { normalizeString, parseAmount, parseId } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

const VALID_TYPES = new Set(['Credit', 'Debit']);
const VALID_CATEGORIES = new Set(['Material', 'Payment', 'Other']);

router.get('/:vendorId', auth, async (req, res) => {
  try {
    const vendorId = parseId(req.params.vendorId);
    if (!vendorId) return res.status(400).json({ error: 'Invalid vendor id' });

    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, userId: req.userId },
      select: { id: true, name: true, phone: true, address: true, status: true },
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const entries = await prisma.vendorLedgerEntry.findMany({
      where: { vendorId, userId: req.userId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: {
        expense: {
          select: {
            date: true,
            remarks: true,
            project: { select: { name: true } },
          },
        },
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

    res.json({ vendor, ledger: ledger.reverse(), currentBalance: balance });
  } catch (err) {
    sendServerError(res, err, 'vendor-ledger GET');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const vendorId = parseId(req.body.vendorId);
    const amount = parseAmount(req.body.amount);
    const type = normalizeString(req.body.type);
    const category = normalizeString(req.body.category);
    const remarks = normalizeString(req.body.remarks);
    const comment = normalizeString(req.body.comment);

    if (!vendorId || amount === null || !type || !category) {
      return res.status(400).json({ error: 'Vendor, amount, type, and category are required' });
    }
    if (!VALID_TYPES.has(type)) return res.status(400).json({ error: 'Invalid ledger type' });
    if (!VALID_CATEGORIES.has(category)) return res.status(400).json({ error: 'Invalid ledger category' });
    if (amount <= 0 || amount > 100000000) {
      return res.status(400).json({ error: 'Amount must be between 1 and 10,00,00,000' });
    }
    if (remarks.length > 500) return res.status(400).json({ error: 'Remarks cannot exceed 500 characters' });
    if (comment.length > 2000) return res.status(400).json({ error: 'Comment cannot exceed 2000 characters' });

    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, userId: req.userId },
      select: { id: true },
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const entry = await prisma.vendorLedgerEntry.create({
      data: {
        vendorId,
        amount,
        type,
        category,
        remarks: remarks || null,
        comment: comment || null,
        userId: req.userId,
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    sendServerError(res, err, 'vendor-ledger POST');
  }
});

module.exports = router;
