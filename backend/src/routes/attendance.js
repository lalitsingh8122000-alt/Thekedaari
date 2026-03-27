const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { workerId, projectId, startDate, endDate } = req.query;
    const where = { userId: req.userId };

    if (workerId) where.workerId = parseInt(workerId);
    if (projectId) where.projectId = parseInt(projectId);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
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

    const attendanceIds = attendance.map((a) => a.id);
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
    const { workerId, projectId, date, type, salary, payment, paymentNote } = req.body;

    if (!workerId || !projectId || !date || !type) {
      return res.status(400).json({ error: 'Worker, project, date, and type are required' });
    }

    const worker = await prisma.worker.findFirst({
      where: { id: parseInt(workerId), userId: req.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    let calculatedSalary = salary !== undefined ? parseFloat(salary) : worker.costPerDay;
    if (salary === undefined) {
      if (type === 'HalfDay') calculatedSalary = worker.costPerDay / 2;
      else if (type === 'Other' || type === 'Absent') calculatedSalary = 0;
    }
    if (type === 'Absent') calculatedSalary = 0;

    const paymentAmount = payment ? parseFloat(payment) : 0;

    const result = await prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.create({
        data: {
          workerId: parseInt(workerId),
          projectId: parseInt(projectId),
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
            workerId: parseInt(workerId),
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
        if (paymentNote && paymentNote.trim()) {
          paymentRemarks += ` | ${paymentNote.trim()}`;
        }
        await tx.ledgerEntry.create({
          data: {
            workerId: parseInt(workerId),
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
    const id = parseInt(req.params.id);

    const existing = await prisma.attendance.findFirst({
      where: { id, userId: req.userId },
      include: { worker: true },
    });
    if (!existing) return res.status(404).json({ error: 'Attendance not found' });

    let calculatedSalary = salary !== undefined ? parseFloat(salary) : existing.salary;
    if (salary === undefined && type) {
      if (type === 'FullDay') calculatedSalary = existing.worker.costPerDay;
      else if (type === 'HalfDay') calculatedSalary = existing.worker.costPerDay / 2;
    }
    if (type === 'Absent') calculatedSalary = 0;

    const paymentAmount = payment !== undefined ? parseFloat(payment) : null;

    const result = await prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.update({
        where: { id },
        data: {
          ...(projectId && { projectId: parseInt(projectId) }),
          ...(date && { date: new Date(date) }),
          ...(type && { type }),
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
        if (paymentNote && paymentNote.trim()) {
          paymentRemarks += ` | ${paymentNote.trim()}`;
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
