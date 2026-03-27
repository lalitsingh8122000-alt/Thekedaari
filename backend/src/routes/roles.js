const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { workers: true } } },
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Role name is required' });

    const role = await prisma.role.create({
      data: { name, userId: req.userId },
    });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
