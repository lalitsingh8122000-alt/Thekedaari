const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `worker-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', auth, async (req, res) => {
  try {
    const { name, status, roleId } = req.query;
    const where = { userId: req.userId };

    if (name) where.name = { contains: name };
    if (status) where.status = status;
    if (roleId) where.roleId = parseInt(roleId);

    const workers = await prisma.worker.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { role: true },
    });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const worker = await prisma.worker.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
      include: { role: true },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { name, phone, costPerDay, roleId, status } = req.body;

    if (!name || !phone || !costPerDay || !roleId) {
      return res.status(400).json({ error: 'Name, phone, cost per day, and role are required' });
    }

    const worker = await prisma.worker.create({
      data: {
        name,
        phone,
        costPerDay: parseFloat(costPerDay),
        roleId: parseInt(roleId),
        status: status || 'Active',
        photo: req.file ? `/uploads/${req.file.filename}` : null,
        userId: req.userId,
      },
      include: { role: true },
    });

    res.status(201).json(worker);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const { name, phone, costPerDay, roleId, status } = req.body;

    const existing = await prisma.worker.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Worker not found' });

    const data = {};
    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (costPerDay) data.costPerDay = parseFloat(costPerDay);
    if (roleId) data.roleId = parseInt(roleId);
    if (status) data.status = status;
    if (req.file) data.photo = `/uploads/${req.file.filename}`;

    const worker = await prisma.worker.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { role: true },
    });

    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
