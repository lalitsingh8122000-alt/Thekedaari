const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { name, type, status } = req.query;
    const where = { userId: req.userId };

    if (name) where.name = { contains: name };
    if (type) where.type = type;
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: { select: { attendances: true, incomes: true, expenses: true } },
      },
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
      include: {
        _count: { select: { attendances: true, incomes: true, expenses: true } },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, startDate, expectedEndDate, type } = req.body;

    if (!name || !startDate || !expectedEndDate || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        startDate: new Date(startDate),
        expectedEndDate: new Date(expectedEndDate),
        type,
        userId: req.userId,
      },
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, startDate, expectedEndDate, type, status } = req.body;

    const existing = await prisma.project.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(expectedEndDate && { expectedEndDate: new Date(expectedEndDate) }),
        ...(type && { type }),
        ...(status && { status }),
      },
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
