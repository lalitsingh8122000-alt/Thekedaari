const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { resolveAccess, initialAccessForNewUser } = require('../src/services/subscriptionService');
const bcrypt = require('bcryptjs');

async function testFlow() {
  console.log('--- Starting Integration Test ---');
  const testPhone = '9999900001';
  await prisma.subscription.deleteMany({ where: { user: { phone: testPhone } } });
  await prisma.user.deleteMany({ where: { phone: testPhone } });

  // 1. Simulate registration
  const access = initialAccessForNewUser();
  console.log('Step 1: initialAccessForNewUser:', access);
  if (!access.planExpiresAt || access.planStatus !== 'trial') {
    throw new Error('Initial access failed to set trial');
  }

  const hashedPassword = await bcrypt.hash('secret123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'New Test Contractor',
      phone: testPhone,
      password: hashedPassword,
      planExpiresAt: access.planExpiresAt,
      planStatus: access.planStatus,
      isLegacyUser: access.isLegacyUser,
    }
  });

  await prisma.subscription.create({
    data: {
      userId: user.id,
      status: 'active',
      source: 'trial',
      startsAt: user.createdAt,
      endsAt: access.planExpiresAt,
      amountInPaise: 0,
      notes: 'Free trial (7 days)',
    }
  });

  // 2. Check access during trial
  const trialResolved = resolveAccess(user);
  console.log('Step 2: Trial access check:', {
    isActive: trialResolved.isActive,
    isTrial: trialResolved.isTrial,
    status: trialResolved.status,
    daysLeft: trialResolved.daysLeft,
    showRenewalReminder: trialResolved.showRenewalReminder,
  });

  if (!trialResolved.isActive || !trialResolved.isTrial || trialResolved.showRenewalReminder !== false) {
    throw new Error('Trial access check failed');
  }

  // 3. Simulate 7 days passed
  const expiredDate = new Date(Date.now() - 60000);
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { planExpiresAt: expiredDate }
  });

  const expiredResolved = resolveAccess(updatedUser);
  console.log('Step 3: Expired trial access check:', {
    isActive: expiredResolved.isActive,
    isTrial: expiredResolved.isTrial,
    status: expiredResolved.status,
    daysLeft: expiredResolved.daysLeft,
  });

  if (expiredResolved.isActive !== false || expiredResolved.isTrial !== false || expiredResolved.status !== 'expired') {
    throw new Error('Expired trial check failed');
  }

  // 4. Verify existing paid user is unaffected
  const paidUser = await prisma.user.findFirst({
    where: { planStatus: 'active', currentPlanCode: { not: null } }
  });
  if (paidUser) {
    const paidResolved = resolveAccess(paidUser);
    console.log('Step 4: Existing paid user check (' + paidUser.phone + '):', {
      isActive: paidResolved.isActive,
      isTrial: paidResolved.isTrial,
      status: paidResolved.status,
      currentPlanCode: paidResolved.currentPlanCode,
    });
    if (!paidResolved.isActive || paidResolved.isTrial !== false || paidResolved.status !== 'active') {
      throw new Error('Existing paid user was incorrectly altered');
    }
  }

  // Cleanup
  await prisma.subscription.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log('Step 5: Cleanup complete. All integration test checks PASSED!');
}

testFlow()
  .catch((err) => {
    console.error('Test FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
