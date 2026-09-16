const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { normalizeString, normalizePhone, isValidPhone } = require('../utils/validation');
const { ensureDefaultContractTrades } = require('../utils/defaultContractTrades');
const { ensureDefaultRoles } = require('../utils/defaultRoles');
const { sendRouteError } = require('../utils/serverError');
const {
  initialAccessForNewUser,
  resolveAccess,
} = require('../services/subscriptionService');

const router = express.Router();
const prisma = new PrismaClient();

/** Shape the client stores in localStorage. Access fields ride along so the UI can gate instantly. */
function publicUser(user) {
  const access = resolveAccess(user);
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt,
    planExpiresAt: user.planExpiresAt || null,
    planStatus: access.status,
    isLegacyUser: access.isLegacyUser,
    currentPlanCode: access.currentPlanCode,
    subscriptionActive: access.isActive,
  };
}

router.post('/register', async (req, res) => {
  try {
    const name = normalizeString(req.body.name);
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    if (!name || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }
    if (password.length < 6 || password.length > 72) {
      return res.status(400).json({ error: 'Password must be between 6 and 72 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Sign-ups before the paid-launch cutoff keep the free founder window;
    // after it they land on the plans screen (or get a trial, if one is configured).
    const access = initialAccessForNewUser();

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          phone,
          password: hashedPassword,
          planExpiresAt: access.planExpiresAt,
          planStatus: access.planStatus,
          isLegacyUser: access.isLegacyUser,
        },
      });
      if (access.planExpiresAt) {
        await tx.subscription.create({
          data: {
            userId: u.id,
            status: 'active',
            source: access.isLegacyUser ? 'legacy' : 'trial',
            startsAt: u.createdAt,
            endsAt: access.planExpiresAt,
            amountInPaise: 0,
            notes: access.isLegacyUser ? 'Founder member — free access window' : 'Free trial',
          },
        });
      }
      await ensureDefaultContractTrades(tx, u.id);
      await ensureDefaultRoles(tx, u.id);
      return u;
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    sendRouteError(res, err, 'auth register');
  }
});

router.post('/login', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || '');

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    const rawPhone = String(req.body.phone || '').trim();
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user && rawPhone !== phone) {
      user = await prisma.user.findUnique({ where: { phone: rawPhone } });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid phone number or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid phone number or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user: publicUser(user) });
  } catch (err) {
    sendRouteError(res, err, 'auth login');
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    const user = await prisma.user.findUnique({ where: { phone }, select: { id: true, name: true, phone: true } });

    await prisma.forgotPasswordRequest.create({
      data: {
        phone,
        userId:       user ? user.id   : null,
        userName:     user ? user.name : null,
        isRegistered: !!user,
      },
    });

    // Return the same response whether or not the phone is registered (security best practice)
    res.json({ success: true });
  } catch (err) {
    sendRouteError(res, err, 'auth forgot-password');
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        planExpiresAt: true,
        planStatus: true,
        isLegacyUser: true,
        currentPlanCode: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(publicUser(user));
  } catch (err) {
    sendRouteError(res, err, 'auth me');
  }
});

module.exports = router;
