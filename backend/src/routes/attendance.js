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

const attendanceInclude = {
  worker: { select: { id: true, name: true, costPerDay: true } },
  project: { select: { id: true, name: true } },
  ledgerEntry: { select: { id: true, amount: true } },
  splitSecondaries: {
    select: {
      id: true,
      projectId: true,
      salary: true,
      project: { select: { id: true, name: true } },
    },
  },
  splitParent: {
    select: {
      id: true,
      projectId: true,
      salary: true,
      project: { select: { id: true, name: true } },
    },
  },
};

function splitAmount5050(total) {
  const t = Math.round(Number(total) * 100) / 100;
  const a = Math.round((t / 2) * 100) / 100;
  const b = Math.round((t - a) * 100) / 100;
  return [a, b];
}

function paymentRemarksBase(primaryAttendanceId) {
  return `Attendance payment att:${primaryAttendanceId}`;
}

function labourExpenseNotesBase(attendanceId) {
  return `Attendance wage att:${attendanceId}`;
}

async function removeOldPaymentStyleLabourExpenses(tx, userId, attendanceId) {
  await tx.expense.deleteMany({
    where: {
      userId,
      remarks: 'Labour',
      notes: { startsWith: paymentRemarksBase(attendanceId) },
    },
  });
}

async function deleteLabourWageExpense(tx, userId, attendanceId) {
  await tx.expense.deleteMany({
    where: {
      userId,
      remarks: 'Labour',
      notes: { startsWith: labourExpenseNotesBase(attendanceId) },
    },
  });
}

async function upsertLabourExpenseForAttendance(
  tx,
  { userId, attendanceId, workerId, projectId, salaryAmount, typeLabel, projectName, attDate }
) {
  await removeOldPaymentStyleLabourExpenses(tx, userId, attendanceId);
  const base = labourExpenseNotesBase(attendanceId);
  const existing = await tx.expense.findFirst({
    where: { userId, notes: { startsWith: base } },
  });
  if (salaryAmount > 0) {
    const fullNotes = `${base} — ${typeLabel} — ${projectName}`;
    if (existing) {
      await tx.expense.update({
        where: { id: existing.id },
        data: {
          projectId,
          amount: salaryAmount,
          workerId,
          remarks: 'Labour',
          notes: fullNotes,
          date: attDate,
        },
      });
    } else {
      await tx.expense.create({
        data: {
          projectId,
          amount: salaryAmount,
          remarks: 'Labour',
          notes: fullNotes,
          workerId,
          date: attDate,
          userId,
        },
      });
    }
  } else if (existing) {
    await tx.expense.delete({ where: { id: existing.id } });
  }
}

function isSplitPair(att) {
  return !!(att.primarySplitId || (att.splitSecondaries && att.splitSecondaries.length > 0));
}

function getPrimaryAttendanceId(att) {
  return att.primarySplitId || att.id;
}

function displayPaymentForSplitRow(att, paymentMap) {
  const anchorId = getPrimaryAttendanceId(att);
  const raw = paymentMap[anchorId]?.amount ?? 0;
  if (!raw) return { amount: 0, note: paymentMap[anchorId]?.note || '' };
  if (isSplitPair(att)) {
    return {
      amount: Math.round((raw / 2) * 100) / 100,
      note: paymentMap[anchorId]?.note || '',
    };
  }
  return { amount: raw, note: paymentMap[anchorId]?.note || '' };
}

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
      include: attendanceInclude,
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
        const attId = parseInt(match[1], 10);
        if (paymentMap[attId] !== undefined) return;
        const noteMatch = p.remarks.match(/\| (.+)$/);
        paymentMap[attId] = {
          amount: p.amount,
          note: noteMatch ? noteMatch[1] : '',
        };
      }
    });

    const result = attendance.map((a) => {
      const { displayPayment, note } = displayPaymentForSplitRow(a, paymentMap);
      const partner = a.primarySplitId ? a.splitParent : a.splitSecondaries?.[0] || null;
      const payAnchor = getPrimaryAttendanceId(a);
      const paymentTotal = paymentMap[payAnchor]?.amount ?? 0;
      return {
        ...a,
        payment: displayPayment,
        paymentNote: note,
        paymentTotal,
        splitPartner: partner,
        isSplitHalfDay: isSplitPair(a),
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Attendance GET error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const workerId = parseId(req.body.workerId);
    const projectId = parseId(req.body.projectId);
    const secondProjectId = parseId(req.body.secondProjectId);
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

    if (secondProjectId && type !== 'HalfDay') {
      return res.status(400).json({ error: 'Second project is only allowed for half day attendance' });
    }
    const isSplitHalf = !!(secondProjectId && type === 'HalfDay');
    if (isSplitHalf && secondProjectId === projectId) {
      return res.status(400).json({ error: 'Second project must be different from the first project' });
    }

    const worker = await prisma.worker.findFirst({
      where: { id: workerId, userId: req.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    if (isSplitHalf) {
      const p2 = await prisma.project.findFirst({
        where: { id: secondProjectId, userId: req.userId },
      });
      if (!p2) return res.status(404).json({ error: 'Second project not found' });
    }

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    const alreadyMarked = await prisma.attendance.findFirst({
      where: {
        userId: req.userId,
        workerId,
        date: { gte: dayStart, lt: dayEnd },
      },
      select: { id: true },
    });
    if (alreadyMarked) {
      return res.status(409).json({
        error: 'Attendance already marked for this worker on selected date',
        attendanceId: alreadyMarked.id,
      });
    }

    let calculatedSalary = salary !== undefined ? parseAmount(salary) : worker.costPerDay;
    if (calculatedSalary === null) {
      return res.status(400).json({ error: 'Invalid salary amount' });
    }
    if (salary === undefined) {
      if (type === 'HalfDay') {
        calculatedSalary = isSplitHalf ? worker.costPerDay : worker.costPerDay / 2;
      } else if (type === 'Other' || type === 'Absent') calculatedSalary = 0;
    }
    if (type === 'Absent') calculatedSalary = 0;
    if (calculatedSalary < 0 || calculatedSalary > 1000000) {
      return res.status(400).json({ error: 'Salary must be between 0 and 10,00,000' });
    }

    const paymentAmount = payment ? parseAmount(payment) : 0;
    if (paymentAmount === null || paymentAmount < 0 || paymentAmount > 100000000) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    if (isSplitHalf) {
      const [s1, s2] = splitAmount5050(calculatedSalary);
      const result = await prisma.$transaction(async (tx) => {
        const att1 = await tx.attendance.create({
          data: {
            workerId,
            projectId,
            date: new Date(date),
            type: 'HalfDay',
            salary: s1,
            userId: req.userId,
          },
          include: {
            worker: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
        });
        const att2 = await tx.attendance.create({
          data: {
            workerId,
            projectId: secondProjectId,
            date: new Date(date),
            type: 'HalfDay',
            salary: s2,
            userId: req.userId,
            primarySplitId: att1.id,
          },
          include: {
            worker: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
        });

        if (s1 > 0) {
          await tx.ledgerEntry.create({
            data: {
              workerId,
              amount: s1,
              type: 'Credit',
              category: 'Salary',
              remarks: `HalfDay - ${att1.project.name}`,
              attendanceId: att1.id,
              userId: req.userId,
            },
          });
        }
        if (s2 > 0) {
          await tx.ledgerEntry.create({
            data: {
              workerId,
              amount: s2,
              type: 'Credit',
              category: 'Salary',
              remarks: `HalfDay - ${att2.project.name}`,
              attendanceId: att2.id,
              userId: req.userId,
            },
          });
        }

        const attDate = new Date(date);
        await upsertLabourExpenseForAttendance(tx, {
          userId: req.userId,
          attendanceId: att1.id,
          workerId,
          projectId: att1.projectId,
          salaryAmount: s1,
          typeLabel: 'HalfDay',
          projectName: att1.project.name,
          attDate,
        });
        await upsertLabourExpenseForAttendance(tx, {
          userId: req.userId,
          attendanceId: att2.id,
          workerId,
          projectId: att2.projectId,
          salaryAmount: s2,
          typeLabel: 'HalfDay',
          projectName: att2.project.name,
          attDate,
        });

        if (paymentAmount > 0) {
          let payRemarks = paymentRemarksBase(att1.id);
          if (paymentNote) payRemarks += ` | ${paymentNote}`;
          await tx.ledgerEntry.create({
            data: {
              workerId,
              amount: paymentAmount,
              type: 'Debit',
              category: 'Payment',
              remarks: payRemarks,
              userId: req.userId,
            },
          });
        }

        return {
          ...att1,
          splitSecondary: att2,
          payment: paymentAmount ? Math.round((paymentAmount / 2) * 100) / 100 : 0,
          paymentNote: paymentNote || '',
          isSplitHalfDay: true,
        };
      });
      return res.status(201).json(result);
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

      const attDateSingle = new Date(date);
      await upsertLabourExpenseForAttendance(tx, {
        userId: req.userId,
        attendanceId: attendance.id,
        workerId,
        projectId: attendance.projectId,
        salaryAmount: calculatedSalary,
        typeLabel: type,
        projectName: attendance.project.name,
        attDate: attDateSingle,
      });

      if (paymentAmount > 0) {
        let paymentRemarks = paymentRemarksBase(attendance.id);
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
    console.error('Attendance POST error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { projectId, date, type, salary, payment, paymentNote, removeSplit, secondProjectId: bodySecondProjectId } =
      req.body;
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid attendance id' });

    const existing = await prisma.attendance.findFirst({
      where: { id, userId: req.userId },
      include: {
        worker: true,
        splitParent: true,
        splitSecondaries: true,
      },
    });
    if (!existing) return res.status(404).json({ error: 'Attendance not found' });

    let primaryAtt = existing.primarySplitId ? existing.splitParent : existing;
    const secondaryAtt = existing.primarySplitId ? existing : existing.splitSecondaries?.[0];
    if (existing.primarySplitId && !primaryAtt) {
      primaryAtt = await prisma.attendance.findUnique({ where: { id: existing.primarySplitId } });
    }
    const isSplit = !!(primaryAtt && secondaryAtt && secondaryAtt.primarySplitId === primaryAtt.id);

    let calculatedSalary = salary !== undefined ? parseAmount(salary) : null;
    if (calculatedSalary === null) {
      if (isSplit) {
        calculatedSalary = (primaryAtt.salary || 0) + (secondaryAtt.salary || 0);
      } else {
        calculatedSalary = existing.salary;
      }
    }
    if (calculatedSalary === null) return res.status(400).json({ error: 'Invalid salary amount' });
    const cleanType = type !== undefined ? normalizeString(type) : undefined;
    if (cleanType !== undefined && !VALID_ATTENDANCE_TYPES.has(cleanType)) {
      return res.status(400).json({ error: 'Invalid attendance type' });
    }
    const effectiveType = cleanType || existing.type;

    if (salary === undefined && cleanType) {
      if (cleanType === 'FullDay') calculatedSalary = existing.worker.costPerDay;
      else if (cleanType === 'HalfDay') {
        calculatedSalary = isSplit ? existing.worker.costPerDay : existing.worker.costPerDay / 2;
      }
    }
    if (cleanType === 'Absent' || effectiveType === 'Absent') calculatedSalary = 0;
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

    const parsedSecondProjectId = bodySecondProjectId !== undefined ? parseId(bodySecondProjectId) : undefined;
    if (bodySecondProjectId !== undefined && bodySecondProjectId !== null && bodySecondProjectId !== '' && !parsedSecondProjectId) {
      return res.status(400).json({ error: 'Invalid second project' });
    }

    const effectiveDate = date || existing.date.toISOString().slice(0, 10);
    const dayStart = new Date(`${effectiveDate}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const duplicateForDate = await prisma.attendance.findFirst({
      where: {
        userId: req.userId,
        workerId: existing.workerId,
        id: { not: id },
        date: { gte: dayStart, lt: dayEnd },
      },
      select: { id: true },
    });
    if (duplicateForDate) {
      const allowedBuddy =
        isSplit &&
        (duplicateForDate.id === secondaryAtt?.id ||
          duplicateForDate.id === primaryAtt?.id);
      if (!allowedBuddy) {
        return res.status(409).json({ error: 'Another attendance already exists for this worker on selected date' });
      }
    }

    const wantsRemoveSplit = removeSplit === true || req.body.secondProjectId === null;
    const shouldEndSplit =
      isSplit &&
      (wantsRemoveSplit ||
        cleanType === 'FullDay' ||
        cleanType === 'Absent' ||
        cleanType === 'Other');

    const result = await prisma.$transaction(async (tx) => {
      if (isSplit && shouldEndSplit) {
        const sec = secondaryAtt;
        const prim = primaryAtt;
        const secLedger = await tx.ledgerEntry.findUnique({ where: { attendanceId: sec.id } });
        if (secLedger) await tx.ledgerEntry.delete({ where: { id: secLedger.id } });
        await deleteLabourWageExpense(tx, req.userId, sec.id);
        await tx.attendance.delete({ where: { id: sec.id } });

        const finalType = cleanType || primaryAtt.type;
        let newSalary = calculatedSalary;
        if (cleanType === 'FullDay' || finalType === 'FullDay') newSalary = existing.worker.costPerDay;
        else if (finalType === 'Absent') newSalary = 0;
        else if (finalType === 'HalfDay' && salary === undefined) newSalary = existing.worker.costPerDay / 2;

        const attendance = await tx.attendance.update({
          where: { id: prim.id },
          data: {
            ...(parsedProjectId && { projectId: parsedProjectId }),
            ...(date && { date: new Date(date) }),
            ...(cleanType && { type: cleanType }),
            salary: newSalary,
          },
          include: {
            worker: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
        });

        const primLedger = await tx.ledgerEntry.findUnique({ where: { attendanceId: prim.id } });
        if (primLedger) {
          if (newSalary > 0) {
            await tx.ledgerEntry.update({
              where: { attendanceId: prim.id },
              data: {
                amount: newSalary,
                remarks: `${attendance.type} - ${attendance.project.name}`,
              },
            });
          } else {
            await tx.ledgerEntry.delete({ where: { attendanceId: prim.id } });
          }
        } else if (newSalary > 0) {
          await tx.ledgerEntry.create({
            data: {
              workerId: existing.workerId,
              amount: newSalary,
              type: 'Credit',
              category: 'Salary',
              remarks: `${attendance.type} - ${attendance.project.name}`,
              attendanceId: prim.id,
              userId: req.userId,
            },
          });
        }

        if (paymentAmount !== null) {
          let payNote = cleanPaymentNote;
          if (payNote === undefined) {
            const ep = await tx.ledgerEntry.findFirst({
              where: {
                userId: req.userId,
                category: 'Payment',
                remarks: { startsWith: paymentRemarksBase(prim.id) },
              },
            });
            const m = ep?.remarks?.match(/\| (.+)$/);
            payNote = m ? m[1] : '';
          }
          await syncPaymentLedger(tx, req.userId, prim.id, existing.workerId, paymentAmount, payNote || '');
        }

        await upsertLabourExpenseForAttendance(tx, {
          userId: req.userId,
          attendanceId: prim.id,
          workerId: existing.workerId,
          projectId: attendance.projectId,
          salaryAmount: newSalary,
          typeLabel: attendance.type,
          projectName: attendance.project.name,
          attDate: attendance.date,
        });

        return attendance;
      }

      if (isSplit && !shouldEndSplit && (cleanType === undefined || cleanType === 'HalfDay')) {
        const [s1, s2] = splitAmount5050(calculatedSalary);
        const prim = primaryAtt;
        const sec = secondaryAtt;
        const attPrimary = await tx.attendance.update({
          where: { id: prim.id },
          data: {
            ...(parsedProjectId && { projectId: parsedProjectId }),
            ...(date && { date: new Date(date) }),
            type: 'HalfDay',
            salary: s1,
          },
          include: {
            worker: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
        });
        const attSecondary = await tx.attendance.update({
          where: { id: sec.id },
          data: {
            ...(date && { date: new Date(date) }),
            type: 'HalfDay',
            salary: s2,
          },
          include: {
            worker: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
        });

        const l1 = await tx.ledgerEntry.findUnique({ where: { attendanceId: prim.id } });
        const l2 = await tx.ledgerEntry.findUnique({ where: { attendanceId: sec.id } });
        if (l1) {
          if (s1 > 0) {
            await tx.ledgerEntry.update({
              where: { id: l1.id },
              data: { amount: s1, remarks: `HalfDay - ${attPrimary.project.name}` },
            });
          } else await tx.ledgerEntry.delete({ where: { id: l1.id } });
        } else if (s1 > 0) {
          await tx.ledgerEntry.create({
            data: {
              workerId: existing.workerId,
              amount: s1,
              type: 'Credit',
              category: 'Salary',
              remarks: `HalfDay - ${attPrimary.project.name}`,
              attendanceId: prim.id,
              userId: req.userId,
            },
          });
        }
        if (l2) {
          if (s2 > 0) {
            await tx.ledgerEntry.update({
              where: { id: l2.id },
              data: { amount: s2, remarks: `HalfDay - ${attSecondary.project.name}` },
            });
          } else await tx.ledgerEntry.delete({ where: { id: l2.id } });
        } else if (s2 > 0) {
          await tx.ledgerEntry.create({
            data: {
              workerId: existing.workerId,
              amount: s2,
              type: 'Credit',
              category: 'Salary',
              remarks: `HalfDay - ${attSecondary.project.name}`,
              attendanceId: sec.id,
              userId: req.userId,
            },
          });
        }

        if (paymentAmount !== null) {
          let payNote = cleanPaymentNote;
          if (payNote === undefined) {
            const ep = await tx.ledgerEntry.findFirst({
              where: {
                userId: req.userId,
                category: 'Payment',
                remarks: { startsWith: paymentRemarksBase(prim.id) },
              },
            });
            const m = ep?.remarks?.match(/\| (.+)$/);
            payNote = m ? m[1] : '';
          }
          await syncSplitPaymentLedger(tx, req.userId, prim.id, existing.workerId, paymentAmount, payNote || '');
        }

        await upsertLabourExpenseForAttendance(tx, {
          userId: req.userId,
          attendanceId: prim.id,
          workerId: existing.workerId,
          projectId: attPrimary.projectId,
          salaryAmount: s1,
          typeLabel: 'HalfDay',
          projectName: attPrimary.project.name,
          attDate: attPrimary.date,
        });
        await upsertLabourExpenseForAttendance(tx, {
          userId: req.userId,
          attendanceId: sec.id,
          workerId: existing.workerId,
          projectId: attSecondary.projectId,
          salaryAmount: s2,
          typeLabel: 'HalfDay',
          projectName: attSecondary.project.name,
          attDate: attSecondary.date,
        });

        return existing.id === prim.id ? attPrimary : attSecondary;
      }

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

      await upsertLabourExpenseForAttendance(tx, {
        userId: req.userId,
        attendanceId: id,
        workerId: existing.workerId,
        projectId: attendance.projectId,
        salaryAmount: calculatedSalary,
        typeLabel: attendance.type,
        projectName: attendance.project.name,
        attDate: attendance.date,
      });

      if (paymentAmount !== null) {
        const paymentLedgerAnchorId = existing.primarySplitId || id;
        await syncPaymentLedger(
          tx,
          req.userId,
          paymentLedgerAnchorId,
          existing.workerId,
          paymentAmount,
          cleanPaymentNote || ''
        );
      }

      return attendance;
    });

    res.json(result);
  } catch (err) {
    console.error('Attendance PUT error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

async function syncPaymentLedger(tx, userId, attendanceId, workerId, paymentAmount, paymentNote) {
  let paymentRemarks = paymentRemarksBase(attendanceId);
  if (paymentNote) paymentRemarks += ` | ${paymentNote}`;
  const existingPayment = await tx.ledgerEntry.findFirst({
    where: {
      userId,
      category: 'Payment',
      remarks: { startsWith: paymentRemarksBase(attendanceId) },
    },
  });
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
        workerId,
        amount: paymentAmount,
        type: 'Debit',
        category: 'Payment',
        remarks: paymentRemarks,
        userId,
      },
    });
  }
}

async function syncSplitPaymentLedger(tx, userId, primaryAttendanceId, workerId, paymentAmount, paymentNote) {
  let paymentRemarks = paymentRemarksBase(primaryAttendanceId);
  if (paymentNote) paymentRemarks += ` | ${paymentNote}`;
  const existingPayment = await tx.ledgerEntry.findFirst({
    where: {
      userId,
      category: 'Payment',
      remarks: { startsWith: paymentRemarksBase(primaryAttendanceId) },
    },
  });
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
        workerId,
        amount: paymentAmount,
        type: 'Debit',
        category: 'Payment',
        remarks: paymentRemarks,
        userId,
      },
    });
  }
}

module.exports = router;
