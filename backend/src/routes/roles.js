const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { normalizeString } = require('../utils/validation');
const { ensureDefaultRoles } = require('../utils/defaultRoles');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    await ensureDefaultRoles(prisma, req.userId);
    const roles = await prisma.role.findMany({
      where: { userId: req.userId },
      orderBy: { id: 'asc' },
      include: { _count: { select: { workers: true } } },
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const name = normalizeString(req.body.name);
    if (!name) return res.status(400).json({ error: 'Role name is required' });
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Role name must be between 2 and 100 characters' });
    }

    const existing = await prisma.role.findMany({
      where: { userId: req.userId },
      select: { name: true },
    });
    const lower = name.toLowerCase();
    if (existing.some((r) => r.name.toLowerCase() === lower)) {
      return res.status(409).json({ error: 'A role with this name already exists' });
    }

    const role = await prisma.role.create({
      data: { name, userId: req.userId },
    });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
