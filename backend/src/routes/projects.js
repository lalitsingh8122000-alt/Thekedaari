const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const {
  VALID_PROJECT_TYPES,
  VALID_PROJECT_STATUS,
  normalizeString,
  parseId,
  isValidDate,
} = require('../utils/validation');

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
    const projectId = parseId(req.params.id);
    if (!projectId) return res.status(400).json({ error: 'Invalid project id' });
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
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
    const name = normalizeString(req.body.name);
    const startDate = req.body.startDate;
    const expectedEndDate = req.body.expectedEndDate;
    const type = normalizeString(req.body.type);

    if (!name || !startDate || !expectedEndDate || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (name.length < 2 || name.length > 200) {
      return res.status(400).json({ error: 'Project name must be between 2 and 200 characters' });
    }
    if (!VALID_PROJECT_TYPES.has(type)) {
      return res.status(400).json({ error: 'Invalid project type' });
    }
    if (!isValidDate(startDate) || !isValidDate(expectedEndDate)) {
      return res.status(400).json({ error: 'Invalid project dates' });
    }
    if (new Date(startDate) > new Date(expectedEndDate)) {
      return res.status(400).json({ error: 'End date cannot be before start date' });
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
    const projectId = parseId(req.params.id);
    if (!projectId) return res.status(400).json({ error: 'Invalid project id' });
    const { name, startDate, expectedEndDate, type, status } = req.body;

    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    const data = {};
    if (name !== undefined) {
      const cleanName = normalizeString(name);
      if (!cleanName || cleanName.length < 2 || cleanName.length > 200) {
        return res.status(400).json({ error: 'Project name must be between 2 and 200 characters' });
      }
      data.name = cleanName;
    }
    if (type !== undefined) {
      const cleanType = normalizeString(type);
      if (!VALID_PROJECT_TYPES.has(cleanType)) {
        return res.status(400).json({ error: 'Invalid project type' });
      }
      data.type = cleanType;
    }
    if (status !== undefined) {
      const cleanStatus = normalizeString(status);
      if (!VALID_PROJECT_STATUS.has(cleanStatus)) {
        return res.status(400).json({ error: 'Invalid project status' });
      }
      data.status = cleanStatus;
    }
    if (startDate !== undefined) {
      if (!isValidDate(startDate)) return res.status(400).json({ error: 'Invalid start date' });
      data.startDate = new Date(startDate);
    }
    if (expectedEndDate !== undefined) {
      if (!isValidDate(expectedEndDate)) return res.status(400).json({ error: 'Invalid expected end date' });
      data.expectedEndDate = new Date(expectedEndDate);
    }
    const effectiveStart = data.startDate || existing.startDate;
    const effectiveEnd = data.expectedEndDate || existing.expectedEndDate;
    if (effectiveStart > effectiveEnd) {
      return res.status(400).json({ error: 'End date cannot be before start date' });
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
