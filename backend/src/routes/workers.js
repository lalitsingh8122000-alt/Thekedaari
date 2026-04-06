const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { sendServerError } = require('../utils/serverError');
const {
  VALID_WORKER_STATUS,
  normalizeString,
  normalizePhone,
  isValidPhone,
  parseAmount,
  parseId,
  roleNameIsContractor,
} = require('../utils/validation');

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
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

router.get('/', auth, async (req, res) => {
  try {
    const { name, status, roleId } = req.query;
    const where = { userId: req.userId };

    if (name) where.name = { contains: name };
    if (status) {
      const cleanStatus = normalizeString(status);
      if (!VALID_WORKER_STATUS.has(cleanStatus)) {
        return res.status(400).json({ error: 'Invalid worker status' });
      }
      where.status = cleanStatus;
    }
    if (roleId) {
      const parsedRoleId = parseId(roleId);
      if (!parsedRoleId) return res.status(400).json({ error: 'Invalid role id' });
      where.roleId = parsedRoleId;
    }

    const workers = await prisma.worker.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { role: true, contractTrade: true },
    });
    res.json(workers);
  } catch (err) {
    sendServerError(res, err, 'workers GET list');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const workerId = parseId(req.params.id);
    if (!workerId) return res.status(400).json({ error: 'Invalid worker id' });
    const worker = await prisma.worker.findFirst({
      where: { id: workerId, userId: req.userId },
      include: { role: true, contractTrade: true },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    sendServerError(res, err, 'workers GET :id');
  }
});

router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const name = normalizeString(req.body.name);
    const phone = normalizePhone(req.body.phone);
    const costPerDay = parseAmount(req.body.costPerDay);
    const roleId = parseId(req.body.roleId);
    const status = req.body.status ? normalizeString(req.body.status) : 'Active';
    const contractTradeId = parseId(req.body.contractTradeId);

    if (!name || !phone || costPerDay === null || !roleId) {
      return res.status(400).json({ error: 'Name, phone, cost per day, and role are required' });
    }
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Worker name must be between 2 and 100 characters' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }
    if (!VALID_WORKER_STATUS.has(status)) {
      return res.status(400).json({ error: 'Invalid worker status' });
    }
    const role = await prisma.role.findFirst({ where: { id: roleId, userId: req.userId } });
    if (!role) return res.status(400).json({ error: 'Invalid role' });

    const contractorByRole = roleNameIsContractor(role.name);
    const workerType = contractorByRole ? 'Contractor' : 'Labour';
    if (contractorByRole) {
      if (costPerDay < 0 || costPerDay > 1000000) {
        return res.status(400).json({ error: 'Cost per day must be between 0 and 10,00,000' });
      }
      if (!contractTradeId) {
        return res.status(400).json({ error: 'Add a theka sub-type under Roles, then select it for this contractor' });
      }
      const trade = await prisma.contractTrade.findFirst({
        where: { id: contractTradeId, userId: req.userId },
      });
      if (!trade) return res.status(400).json({ error: 'Invalid contract trade' });
    } else if (costPerDay <= 0 || costPerDay > 1000000) {
      return res.status(400).json({ error: 'Cost per day must be between 1 and 10,00,000' });
    }

    const worker = await prisma.worker.create({
      data: {
        name,
        phone,
        costPerDay,
        roleId,
        status,
        workerType,
        contractTradeId: contractorByRole ? contractTradeId : null,
        photo: req.file ? `/uploads/${req.file.filename}` : null,
        userId: req.userId,
      },
      include: { role: true, contractTrade: true },
    });

    res.status(201).json(worker);
  } catch (err) {
    sendServerError(res, err, 'workers POST');
  }
});

router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const workerId = parseId(req.params.id);
    if (!workerId) return res.status(400).json({ error: 'Invalid worker id' });
    const existing = await prisma.worker.findFirst({
      where: { id: workerId, userId: req.userId },
      include: { role: true },
    });
    if (!existing) return res.status(404).json({ error: 'Worker not found' });

    const data = {};
    if (req.body.name !== undefined) {
      const name = normalizeString(req.body.name);
      if (!name || name.length < 2 || name.length > 100) {
        return res.status(400).json({ error: 'Worker name must be between 2 and 100 characters' });
      }
      data.name = name;
    }
    if (req.body.phone !== undefined) {
      const phone = normalizePhone(req.body.phone);
      if (!isValidPhone(phone)) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
      }
      data.phone = phone;
    }
    if (req.body.roleId !== undefined) {
      const roleId = parseId(req.body.roleId);
      if (!roleId) return res.status(400).json({ error: 'Invalid role' });
      const role = await prisma.role.findFirst({ where: { id: roleId, userId: req.userId } });
      if (!role) return res.status(400).json({ error: 'Invalid role' });
      data.roleId = roleId;
    }
    if (req.body.status !== undefined) {
      const status = normalizeString(req.body.status);
      if (!VALID_WORKER_STATUS.has(status)) {
        return res.status(400).json({ error: 'Invalid worker status' });
      }
      data.status = status;
    }
    if (req.body.contractTradeId !== undefined) {
      const tid = parseId(req.body.contractTradeId);
      if (req.body.contractTradeId !== '' && !tid) {
        return res.status(400).json({ error: 'Invalid contract trade' });
      }
      data.contractTradeId = tid || null;
    }
    if (req.file) data.photo = `/uploads/${req.file.filename}`;

    const effectiveRoleId = data.roleId !== undefined ? data.roleId : existing.roleId;
    const role = await prisma.role.findFirst({ where: { id: effectiveRoleId, userId: req.userId } });
    if (!role) return res.status(400).json({ error: 'Invalid role' });

    const contractorByRole = roleNameIsContractor(role.name);
    data.workerType = contractorByRole ? 'Contractor' : 'Labour';
    if (!contractorByRole) {
      data.contractTradeId = null;
    } else {
      const tid =
        data.contractTradeId !== undefined ? data.contractTradeId : existing.contractTradeId;
      if (!tid) {
        return res.status(400).json({ error: 'Add a theka sub-type under Roles, then select it for this contractor' });
      }
      const trade = await prisma.contractTrade.findFirst({
        where: { id: tid, userId: req.userId },
      });
      if (!trade) return res.status(400).json({ error: 'Invalid contract trade' });
      data.contractTradeId = tid;
    }

    if (req.body.costPerDay !== undefined) {
      const costPerDay = parseAmount(req.body.costPerDay);
      if (costPerDay === null) {
        return res.status(400).json({ error: 'Invalid cost per day' });
      }
      if (contractorByRole) {
        if (costPerDay < 0 || costPerDay > 1000000) {
          return res.status(400).json({ error: 'Cost per day must be between 0 and 10,00,000' });
        }
      } else if (costPerDay <= 0 || costPerDay > 1000000) {
        return res.status(400).json({ error: 'Cost per day must be between 1 and 10,00,000' });
      }
      data.costPerDay = costPerDay;
    }

    const worker = await prisma.worker.update({
      where: { id: workerId },
      data,
      include: { role: true, contractTrade: true },
    });

    res.json(worker);
  } catch (err) {
    sendServerError(res, err, 'workers PUT');
  }
});

module.exports = router;
