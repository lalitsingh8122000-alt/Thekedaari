const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;

    const totalIncome = await prisma.income.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const totalMaterialExpense = await prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const totalLabourCost = await prisma.attendance.aggregate({
      where: { userId },
      _sum: { salary: true },
    });

    const income = totalIncome._sum.amount || 0;
    const materialExpense = totalMaterialExpense._sum.amount || 0;
    const labourCost = totalLabourCost._sum.amount || 0;
    const totalExpense = materialExpense + labourCost;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await prisma.attendance.count({
      where: { userId, date: { gte: today, lt: tomorrow } },
    });

    const todayExpense = await prisma.expense.aggregate({
      where: { userId, date: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    });

    const todayLabourCost = await prisma.attendance.aggregate({
      where: { userId, date: { gte: today, lt: tomorrow } },
      _sum: { salary: true },
    });

    const activeProjects = await prisma.project.count({
      where: { userId, status: 'Running' },
    });

    const activeWorkers = await prisma.worker.count({
      where: { userId, status: 'Active' },
    });

    const topProjects = await prisma.project.findMany({
      where: { userId, status: 'Running' },
      take: 5,
      include: {
        expenses: { select: { amount: true } },
        incomes: { select: { amount: true } },
      },
    });

    const topProjectData = topProjects.map((p) => ({
      id: p.id,
      name: p.name,
      totalExpense: p.expenses.reduce((sum, e) => sum + e.amount, 0),
      totalIncome: p.incomes.reduce((sum, i) => sum + i.amount, 0),
    }));

    const recentTransactions = await prisma.ledgerEntry.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { worker: { select: { name: true } } },
    });

    res.json({
      totalIncome: income,
      totalExpense,
      totalMaterialExpense: materialExpense,
      totalLabourCost: labourCost,
      profitLoss: income - totalExpense,
      todayAttendance,
      todayExpense: (todayExpense._sum.amount || 0) + (todayLabourCost._sum.salary || 0),
      activeProjects,
      activeWorkers,
      topProjects: topProjectData,
      recentTransactions,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
