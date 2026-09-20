/**
 * Concurrency race: 20 vendors hold slots... no — maxSlots=5, but only 2
 * credits each; 20 unlock attempts fire in parallel against a lead with
 * exactly 1 remaining slot. Exactly ONE may succeed; ledger must stay
 * consistent and lead must end EXHAUSTED.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stamp = Date.now();

async function main() {
  const lead = await prisma.lead.create({
    data: {
      category: "Venues",
      region: "Pretoria",
      budgetBand: "R40,000 – R80,000",
      contactName: "Race",
      contactEmail: "race@test.local",
      contactPhone: "000",
      maxSlots: 1,
    },
  });

  const racers = [];
  for (let i = 0; i < 20; i++) {
    const u = await prisma.user.create({
      data: { email: `race${stamp}-${i}@test.local`, role: "VENDOR" },
    });
    const v = await prisma.vendor.create({
      data: {
        userId: u.id,
        businessName: `Racer${i}`,
        slug: `race${stamp}-${i}`,
        category: "Venues",
        baseRegion: "Pretoria",
        status: "APPROVED",
      },
    });
    await prisma.leadSlot.create({
      data: { leadId: lead.id, vendorId: v.id, position: i + 1 },
    });
    await prisma.ledgerEntry.create({
      data: {
        vendorId: v.id,
        type: "BONUS",
        deltaCredits: 100,
        balanceAfter: 100,
        idempotencyKey: `race-${stamp}-${i}`,
      },
    });
    racers.push(v.id);
  }

  const { unlockLead } = await import("../src/lib/credits");
  const results = await Promise.all(
    racers.map((vid) =>
      unlockLead({
        vendorId: vid,
        leadId: lead.id,
        idempotencyKey: `race-u-${stamp}-${vid}`,
      }),
    ),
  );
  const wins = results.filter((r) => r.ok).length;
  const leadAfter = await prisma.lead.findUnique({ where: { id: lead.id } });
  console.log(
    `race: ${wins}/20 succeeded, lead status=${leadAfter?.status}, unlocks=${await prisma.leadUnlock.count({ where: { leadId: lead.id } })}`,
  );
  if (wins !== 1) throw new Error(`FAIL: expected exactly 1 winner, got ${wins}`);
  if (leadAfter?.status !== "EXHAUSTED") throw new Error("FAIL: not exhausted");

  // Ledger consistency for all racers
  for (const vid of racers) {
    const entries = await prisma.ledgerEntry.findMany({
      where: { vendorId: vid },
      orderBy: { createdAt: "asc" },
    });
    const sum = entries.reduce((a, e) => a + e.deltaCredits, 0);
    if (sum !== entries[entries.length - 1].balanceAfter)
      throw new Error(`FAIL ledger drift ${vid}`);
  }
  console.log("LOAD RACE PASSED — no oversell, ledger consistent");
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
