const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { sendServerError } = require('../utils/serverError');
const { normalizeString, parseId } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

const VALID_VENDOR_STATUS = new Set(['Active', 'Inactive']);

router.get('/', auth, async (req, res) => {
  try {
    const where = { userId: req.userId };
    const status = normalizeString(req.query.status);
    if (status && VALID_VENDOR_STATUS.has(status)) where.status = status;

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { expenses: true, ledgerEntries: true } },
      },
    });
    res.json(vendors);
  } catch (err) {
    sendServerError(res, err, 'vendors GET');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid vendor id' });

    const vendor = await prisma.vendor.findFirst({
      where: { id, userId: req.userId },
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    sendServerError(res, err, 'vendor GET');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const name = normalizeString(req.body.name);
    const phone = normalizeString(req.body.phone);
    const address = normalizeString(req.body.address);
    const notes = normalizeString(req.body.notes);

    if (name.length < 2) return res.status(400).json({ error: 'Vendor name must be at least 2 characters' });
    if (name.length > 200) return res.status(400).json({ error: 'Vendor name cannot exceed 200 characters' });
    if (phone && phone.length > 20) return res.status(400).json({ error: 'Phone cannot exceed 20 characters' });
    if (address.length > 500) return res.status(400).json({ error: 'Address cannot exceed 500 characters' });
    if (notes.length > 2000) return res.status(400).json({ error: 'Notes cannot exceed 2000 characters' });

    const vendor = await prisma.vendor.create({
      data: {
        name,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
        userId: req.userId,
      },
    });
    res.status(201).json(vendor);
  } catch (err) {
    sendServerError(res, err, 'vendor POST');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid vendor id' });

    const existing = await prisma.vendor.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: 'Vendor not found' });

    const name = normalizeString(req.body.name);
    const phone = normalizeString(req.body.phone);
    const address = normalizeString(req.body.address);
    const notes = normalizeString(req.body.notes);
    const status = normalizeString(req.body.status);

    if (name.length < 2) return res.status(400).json({ error: 'Vendor name must be at least 2 characters' });
    if (name.length > 200) return res.status(400).json({ error: 'Vendor name cannot exceed 200 characters' });
    if (phone && phone.length > 20) return res.status(400).json({ error: 'Phone cannot exceed 20 characters' });
    if (address.length > 500) return res.status(400).json({ error: 'Address cannot exceed 500 characters' });
    if (notes.length > 2000) return res.status(400).json({ error: 'Notes cannot exceed 2000 characters' });
    if (status && !VALID_VENDOR_STATUS.has(status)) return res.status(400).json({ error: 'Invalid status' });

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        name,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
        status: status || existing.status,
      },
    });
    res.json(vendor);
  } catch (err) {
    sendServerError(res, err, 'vendor PUT');
  }
});

module.exports = router;
