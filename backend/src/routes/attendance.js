const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const {
  VALID_ATTENDANCE_TYPES,
  normalizeString,
  parseAmount,
  parseId,
  isValidDate,
} = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { workerId, projectId, startDate, endDate } = req.query;
    const where = { userId: req.userId };

    if (workerId) {
      const parsedWorkerId = parseId(workerId);
      if (!parsedWorkerId) return res.status(400).json({ error: 'Invalid worker id' });
      where.workerId = parsedWorkerId;
    }
    if (projectId) {
      const parsedProjectId = parseId(projectId);
      if (!parsedProjectId) return res.status(400).json({ error: 'Invalid project id' });
      where.projectId = parsedProjectId;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        if (!isValidDate(startDate)) return res.status(400).json({ error: 'Invalid start date' });
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        if (!isValidDate(endDate)) return res.status(400).json({ error: 'Invalid end date' });
        where.date.lte = new Date(endDate);
      }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        worker: { select: { id: true, name: true, costPerDay: true } },
        project: { select: { id: true, name: true } },
        ledgerEntry: { select: { id: true, amount: true } },
      },
    });

    const paymentLedgers = await prisma.ledgerEntry.findMany({
      where: {
        userId: req.userId,
        category: 'Payment',
        remarks: { contains: 'att:' },
      },
      orderBy: { createdAt: 'desc' },
    });

    const paymentMap = {};
    paymentLedgers.forEach((p) => {
      const match = p.remarks.match(/att:(\d+)/);
      if (match) {
        const attId = parseInt(match[1]);
        const noteMatch = p.remarks.match(/\| (.+)$/);
        paymentMap[attId] = {
          amount: p.amount,
          note: noteMatch ? noteMatch[1] : '',
        };
      }
    });

    const result = attendance.map((a) => ({
      ...a,
      payment: paymentMap[a.id]?.amount || 0,
      paymentNote: paymentMap[a.id]?.note || '',
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const workerId = parseId(req.body.workerId);
    const projectId = parseId(req.body.projectId);
    const date = req.body.date;
    const type = normalizeString(req.body.type);
    const salary = req.body.salary;
    const payment = req.body.payment;
    const paymentNote = normalizeString(req.body.paymentNote);

    if (!workerId || !projectId || !date || !type) {
      return res.status(400).json({ error: 'Worker, project, date, and type are required' });
    }
    if (!VALID_ATTENDANCE_TYPES.has(type)) {
      return res.status(400).json({ error: 'Invalid attendance type' });
    }
    if (!isValidDate(date)) return res.status(400).json({ error: 'Invalid attendance date' });
    if (paymentNote.length > 500) return res.status(400).json({ error: 'Payment note cannot exceed 500 characters' });

    const worker = await prisma.worker.findFirst({
      where: { id: workerId, userId: req.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    let calculatedSalary = salary !== undefined ? parseAmount(salary) : worker.costPerDay;
    if (calculatedSalary === null) {
      return res.status(400).json({ error: 'Invalid salary amount' });
    }
    if (salary === undefined) {
      if (type === 'HalfDay') calculatedSalary = worker.costPerDay / 2;
      else if (type === 'Other' || type === 'Absent') calculatedSalary = 0;
    }
    if (type === 'Absent') calculatedSalary = 0;
    if (calculatedSalary < 0 || calculatedSalary > 1000000) {
      return res.status(400).json({ error: 'Salary must be between 0 and 10,00,000' });
    }

    const paymentAmount = payment ? parseAmount(payment) : 0;
    if (paymentAmount === null || paymentAmount < 0 || paymentAmount > 100000000) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.create({
        data: {
          workerId,
          projectId,
          date: new Date(date),
          type,
          salary: calculatedSalary,
          userId: req.userId,
        },
        include: {
          worker: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      });

      if (calculatedSalary > 0) {
        await tx.ledgerEntry.create({
          data: {
            workerId,
            amount: calculatedSalary,
            type: 'Credit',
            category: 'Salary',
            remarks: `${type} - ${attendance.project.name}`,
            attendanceId: attendance.id,
            userId: req.userId,
          },
        });
      }

      if (paymentAmount > 0) {
        let paymentRemarks = `Attendance payment att:${attendance.id}`;
        if (paymentNote) {
          paymentRemarks += ` | ${paymentNote}`;
        }
        await tx.ledgerEntry.create({
          data: {
            workerId,
            amount: paymentAmount,
            type: 'Debit',
            category: 'Payment',
            remarks: paymentRemarks,
            userId: req.userId,
          },
        });
      }

      return { ...attendance, payment: paymentAmount, paymentNote: paymentNote || '' };
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { projectId, date, type, salary, payment, paymentNote } = req.body;
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid attendance id' });

    const existing = await prisma.attendance.findFirst({
      where: { id, userId: req.userId },
      include: { worker: true },
    });
    if (!existing) return res.status(404).json({ error: 'Attendance not found' });

    let calculatedSalary = salary !== undefined ? parseAmount(salary) : existing.salary;
    if (calculatedSalary === null) return res.status(400).json({ error: 'Invalid salary amount' });
    const cleanType = type !== undefined ? normalizeString(type) : undefined;
    if (cleanType !== undefined && !VALID_ATTENDANCE_TYPES.has(cleanType)) {
      return res.status(400).json({ error: 'Invalid attendance type' });
    }
    if (salary === undefined && cleanType) {
      if (cleanType === 'FullDay') calculatedSalary = existing.worker.costPerDay;
      else if (cleanType === 'HalfDay') calculatedSalary = existing.worker.costPerDay / 2;
    }
    if (cleanType === 'Absent') calculatedSalary = 0;
    if (calculatedSalary < 0 || calculatedSalary > 1000000) {
      return res.status(400).json({ error: 'Salary must be between 0 and 10,00,000' });
    }

    const paymentAmount = payment !== undefined ? parseAmount(payment) : null;
    if (paymentAmount !== null && (paymentAmount < 0 || paymentAmount > 100000000)) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    if (date !== undefined && !isValidDate(date)) return res.status(400).json({ error: 'Invalid attendance date' });
    const cleanPaymentNote = paymentNote !== undefined ? normalizeString(paymentNote) : undefined;
    if (cleanPaymentNote !== undefined && cleanPaymentNote.length > 500) {
      return res.status(400).json({ error: 'Payment note cannot exceed 500 characters' });
    }
    const parsedProjectId = projectId !== undefined ? parseId(projectId) : undefined;
    if (projectId !== undefined && !parsedProjectId) return res.status(400).json({ error: 'Invalid project' });
    const result = await prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.update({
        where: { id },
        data: {
          ...(parsedProjectId && { projectId: parsedProjectId }),
          ...(date && { date: new Date(date) }),
          ...(cleanType && { type: cleanType }),
          salary: calculatedSalary,
        },
        include: {
          worker: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      });

      const existingLedger = await tx.ledgerEntry.findUnique({
        where: { attendanceId: id },
      });

      if (existingLedger) {
        if (calculatedSalary > 0) {
          await tx.ledgerEntry.update({
            where: { attendanceId: id },
            data: {
              amount: calculatedSalary,
              remarks: `${attendance.type} - ${attendance.project.name}`,
            },
          });
        } else {
          await tx.ledgerEntry.delete({ where: { attendanceId: id } });
        }
      } else if (calculatedSalary > 0) {
        await tx.ledgerEntry.create({
          data: {
            workerId: existing.workerId,
            amount: calculatedSalary,
            type: 'Credit',
            category: 'Salary',
            remarks: `${attendance.type} - ${attendance.project.name}`,
            attendanceId: id,
            userId: req.userId,
          },
        });
      }

      if (paymentAmount !== null) {
        const existingPayment = await tx.ledgerEntry.findFirst({
          where: {
            userId: req.userId,
            category: 'Payment',
            remarks: { startsWith: `Attendance payment att:${id}` },
          },
        });

        let paymentRemarks = `Attendance payment att:${id}`;
        if (cleanPaymentNote) {
          paymentRemarks += ` | ${cleanPaymentNote}`;
        }

        if (existingPayment) {
          if (paymentAmount > 0) {
            await tx.ledgerEntry.update({
              where: { id: existingPayment.id },
              data: { amount: paymentAmount, remarks: paymentRemarks },
            });
          } else {
            await tx.ledgerEntry.delete({ where: { id: existingPayment.id } });
          }
        } else if (paymentAmount > 0) {
          await tx.ledgerEntry.create({
            data: {
              workerId: existing.workerId,
              amount: paymentAmount,
              type: 'Debit',
              category: 'Payment',
              remarks: paymentRemarks,
              userId: req.userId,
            },
          });
        }
      }

      return attendance;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
