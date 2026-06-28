/**
 * Production Migration Script
 * Data: Rang Sagar — February 2026 Attendance
 * Source: Attendance report PDF (Zam Zam Constructions — Mohammed Wasim)
 *
 * Run on production server:
 *   cd /home/ubuntu/Thekedaari/backend
 *   node scripts/migrate-rang-sagar-feb2026.js
 *
 * Safe to run ONCE. Skips if project already exists.
 */

'use strict';

const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const PROJECT_NAME = 'Rang sagar 1 puliya side';
const USER_PHONE   = '9251191551';

function d(day) {
  return new Date(Date.UTC(2026, 1, day)); // Feb 2026 UTC
}

// 21 workers from PDF — (name, role, costPerDay, presentDays, halfDays, otDays, payment)
const WORKERS = [
  { name: 'karigar जयों',        role: 'Karigar', cpd: 1300, p: [24,25,26,27],                                           h: [],   ot: [],                                                                          pay: 5200  },
  { name: 'अलि',                 role: 'Labour',  cpd: 750,  p: [1,7,10,11,12,13,14,15],                                 h: [],   ot: [],                                                                          pay: 6000  },
  { name: 'अलि भंवर जी बाद',     role: 'Labour',  cpd: 700,  p: [18,19,20,21,22,24],                                     h: [],   ot: [],                                                                          pay: 4200  },
  { name: 'सना',                 role: 'Labour',  cpd: 700,  p: [20,21,22,23,24,25,26,27,28],                             h: [],   ot: [],                                                                          pay: 6300  },
  { name: 'गोविन्द',             role: 'Labour',  cpd: 750,  p: [9,10,12,13,14,15],                                      h: [],   ot: [],                                                                          pay: 4500  },
  { name: 'गोविन्द 700',         role: 'Labour',  cpd: 700,  p: [16,17,18,19,20,21,22,23,24,25,26,27],                   h: [],   ot: [],                                                                          pay: 8400  },
  { name: 'प्रताप पूरी',          role: 'Labour',  cpd: 700,  p: [17,18,19,20,21,22],                                     h: [],   ot: [],                                                                          pay: 4200  },
  { name: 'बाबू कारीगर',         role: 'Karigar', cpd: 1250, p: [21,28],                                                 h: [],   ot: [],                                                                          pay: 2500  },
  { name: 'बाबू के साथ कारीगर',  role: 'Karigar', cpd: 1250, p: [21],                                                    h: [],   ot: [],                                                                          pay: 1250  },
  { name: 'भंवर जी',             role: 'Labour',  cpd: 750,  p: [1,2,3,5,6,7,8,9,10,11,12,13,14,15],                    h: [],   ot: [],                                                                          pay: 6600  },
  { name: 'मजदूर 1',             role: 'Labour',  cpd: 750,  p: [7,8,9,11,13,14,15],                                     h: [12], ot: [],                                                                          pay: 5625  },
  { name: 'मजदूर 2',             role: 'Labour',  cpd: 750,  p: [7,8,10,13,14],                                          h: [],   ot: [],                                                                          pay: 3750  },
  { name: 'मजदूर 3',             role: 'Labour',  cpd: 750,  p: [8,13,14],                                               h: [],   ot: [],                                                                          pay: 2250  },
  { name: 'मजदूर 700 1',         role: 'Labour',  cpd: 700,  p: [18,19],                                                 h: [],   ot: [],                                                                          pay: 1400  },
  { name: 'मजदूर 700 2',         role: 'Labour',  cpd: 700,  p: [18,19,20],                                              h: [],   ot: [],                                                                          pay: 2100  },
  { name: 'मजदूर 700 3',         role: 'Labour',  cpd: 700,  p: [19],                                                    h: [],   ot: [{ day: 19, hours: 1, rate: 700 }],                                          pay: 1400  },
  { name: 'मजदूर 800',           role: 'Labour',  cpd: 800,  p: [22,23,24,25],                                           h: [],   ot: [],                                                                          pay: 3200  },
  { name: 'मनोर जी',             role: 'Karigar', cpd: 1300, p: [18,19,20,21,23,24,25,26],                               h: [],   ot: [],                                                                          pay: 10400 },
  { name: 'लेडीज',               role: 'Labour',  cpd: 550,  p: [11,12,13],                                              h: [],   ot: [],                                                                          pay: 1650  },
  { name: 'लेडीज 500',           role: 'Labour',  cpd: 500,  p: [18,19,20,21,22,23,24,25,26],                            h: [],
    ot: [
      { day: 21, hours: 2, rate: 500 }, { day: 22, hours: 2, rate: 500 }, { day: 23, hours: 2, rate: 500 },
      { day: 24, hours: 3, rate: 500 }, { day: 25, hours: 3, rate: 500 }, { day: 26, hours: 3, rate: 500 },
    ], pay: 12000 },
  { name: 'शाल भंवर जी लड़का',   role: 'Labour',  cpd: 750,  p: [3,5,6,7,11,12,13,14],                                  h: [],   ot: [],                                                                          pay: 6000  },
];

async function main() {
  // ── 1. Find user ──────────────────────────────────────────────────────────
  const user = await p.user.findFirst({ where: { phone: USER_PHONE } });
  if (!user) throw new Error(`User with phone ${USER_PHONE} not found`);
  console.log(`User: ${user.id} — ${user.name}`);

  // ── 2. Guard: skip if project already exists ──────────────────────────────
  const existing = await p.project.findFirst({
    where: { userId: user.id, name: PROJECT_NAME }
  });
  if (existing) {
    console.log(`Project "${PROJECT_NAME}" already exists (id ${existing.id}). Skipping.`);
    await p.$disconnect();
    return;
  }

  // ── 3. Create project ─────────────────────────────────────────────────────
  const project = await p.project.create({
    data: {
      name: PROJECT_NAME,
      startDate: new Date('2026-02-01'),
      expectedEndDate: new Date('2026-02-28'),
      type: 'Building',
      status: 'Completed',
      userId: user.id,
    }
  });
  console.log(`Created project: ${project.id} — ${project.name}`);

  // ── 4. Resolve roles ──────────────────────────────────────────────────────
  const roles = await p.role.findMany({ where: { userId: user.id } });
  const roleMap = {};
  roles.forEach(r => { roleMap[r.name] = r.id; });
  const karigarRoleId = roleMap['Karigar'] ?? roleMap['Labour'];
  const labourRoleId  = roleMap['Labour'];
  if (!labourRoleId) throw new Error('Labour role not found for user');

  let totalAtt = 0, totalExp = 0, totalPay = 0, totalOT = 0;

  // ── 5. Migrate each worker ────────────────────────────────────────────────
  for (const w of WORKERS) {
    const roleId = w.role === 'Karigar' ? karigarRoleId : labourRoleId;

    const worker = await p.worker.create({
      data: {
        name: w.name,
        phone: '',
        costPerDay: w.cpd,
        roleId,
        userId: user.id,
        workerType: 'Labour',
        status: 'Active',
      }
    });

    const otMap = {};
    for (const ot of (w.ot || [])) otMap[ot.day] = ot;

    const attIdByDay = {};

    // Present days
    for (const day of w.p) {
      const att = await p.attendance.create({
        data: {
          workerId: worker.id,
          projectId: project.id,
          date: d(day),
          type: 'FullDay',
          salary: w.cpd,
          userId: user.id,
        }
      });
      attIdByDay[day] = att.id;
      totalAtt++;

      // Labour expense (so Finance shows correct cost)
      await p.expense.create({
        data: {
          projectId: project.id,
          amount: w.cpd,
          remarks: 'Labour',
          notes: `Attendance wage att:${att.id} — FullDay — ${PROJECT_NAME}`,
          workerId: worker.id,
          date: d(day),
          userId: user.id,
        }
      });
      totalExp++;
    }

    // Half days
    for (const day of (w.h || [])) {
      const halfSalary = w.cpd / 2;
      const att = await p.attendance.create({
        data: {
          workerId: worker.id,
          projectId: project.id,
          date: d(day),
          type: 'HalfDay',
          salary: halfSalary,
          userId: user.id,
        }
      });
      attIdByDay[day] = att.id;
      totalAtt++;

      await p.expense.create({
        data: {
          projectId: project.id,
          amount: halfSalary,
          remarks: 'Labour',
          notes: `Attendance wage att:${att.id} — HalfDay — ${PROJECT_NAME}`,  // HalfDay is correct
          workerId: worker.id,
          date: d(day),
          userId: user.id,
        }
      });
      totalExp++;
    }

    // OT Bonus LedgerEntries (per OT day)
    for (const ot of (w.ot || [])) {
      const attId = attIdByDay[ot.day];
      if (!attId) continue;
      const otAmount = ot.hours * ot.rate;
      await p.ledgerEntry.create({
        data: {
          workerId: worker.id,
          amount: otAmount,
          type: 'Credit',
          category: 'Bonus',
          remarks: `Overtime att:${attId} — ${PROJECT_NAME}`,
          userId: user.id,
        }
      });
      totalOT++;
    }

    // Monthly payment LedgerEntry (one per worker)
    if (w.pay > 0) {
      const allDays = [...w.p, ...(w.h || [])].sort((a, b) => a - b);
      const firstAttId = attIdByDay[allDays[0]];
      await p.ledgerEntry.create({
        data: {
          workerId: worker.id,
          amount: w.pay,
          type: 'Debit',
          category: 'Payment',
          remarks: `Attendance payment att:${firstAttId} — ${PROJECT_NAME} | Feb 2026`,
          userId: user.id,
        }
      });
      totalPay++;
    }

    console.log(`  ✓ ${w.name.padEnd(30)} ${(w.p.length + (w.h||[]).length)} days  paid ₹${w.pay}`);
  }

  // ── 6. Summary ────────────────────────────────────────────────────────────
  const totalSalary = await p.expense.aggregate({
    where: { projectId: project.id, remarks: 'Labour' },
    _sum: { amount: true }
  });
  const totalPaid = await p.ledgerEntry.aggregate({
    where: { userId: user.id, category: 'Payment', remarks: { contains: PROJECT_NAME } },
    _sum: { amount: true }
  });

  console.log('');
  console.log('════════════════════════════════════');
  console.log('  Migration Complete!');
  console.log('════════════════════════════════════');
  console.log(`  Workers:            ${WORKERS.length}`);
  console.log(`  Attendance records: ${totalAtt}   (expected 122)`);
  console.log(`  Expense records:    ${totalExp}   (labour cost in Finance)`);
  console.log(`  Payment entries:    ${totalPay}   (visible in Transactions)`);
  console.log(`  OT bonus entries:   ${totalOT}    (expected 7)`);
  console.log(`  Labour cost shown:  ₹${totalSalary._sum.amount}  (expected 94625)`);
  console.log(`  Total paid:         ₹${totalPaid._sum.amount}  (expected 98925)`);
  console.log('════════════════════════════════════');

  await p.$disconnect();
}

main().catch(async e => {
  console.error('Migration failed:', e.message);
  await p.$disconnect();
  process.exit(1);
});
