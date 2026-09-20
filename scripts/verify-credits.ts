/**
 * Critical-path verification for the credit ledger (runs against real DB).
 * Covers: grant, unlock, double-unlock block, exhausted cap, insufficient
 * credits, idempotent replay.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CAT = "Venues"; // cost 40

async function main() {
  const stamp = Date.now();
  // Three fresh test vendors with slots on a fresh lead
  const vendors = [];
  for (let i = 0; i < 3; i++) {
    const u = await prisma.user.create({
      data: { email: `t${stamp}-${i}@test.local`, role: "VENDOR" },
    });
    vendors.push(
      await prisma.vendor.create({
        data: {
          userId: u.id,
          businessName: `TestVendor${i}`,
          slug: `t${stamp}-${i}`,
          category: CAT,
          baseRegion: "Pretoria",
          status: "APPROVED",
        },
      }),
    );
  }
  const lead = await prisma.lead.create({
    data: {
      category: CAT,
      region: "Pretoria",
      budgetBand: "R40,000 – R80,000",
      contactName: "Test Couple",
      contactEmail: "couple@test.local",
      contactPhone: "000",
      maxSlots: 2,
    },
  });
  await prisma.leadSlot.createMany({
    data: vendors.slice(0, 2).map((v, i) => ({ leadId: lead.id, vendorId: v.id, position: i + 1 })),
  });

  const { grantCredits, unlockLead } = await import("../src/lib/credits");

  // 1. Grant 100 credits to vendor 0 — and replay same key
  const g1 = await grantCredits({ vendorId: vendors[0].id, credits: 100, type: "BONUS", idempotencyKey: `t-${stamp}-g0` });
  const g1replay = await grantCredits({ vendorId: vendors[0].id, credits: 100, type: "BONUS", idempotencyKey: `t-${stamp}-g0` });
  console.log("grant:", g1.balance, "replay-balance-still:", g1replay.balance);
  if (g1.balance !== 100 || g1replay.balance !== 100) throw new Error("FAIL grant/replay");

  // 2. Vendor 1 has 20 credits (< 40) → insufficient
  await grantCredits({ vendorId: vendors[1].id, credits: 20, type: "BONUS", idempotencyKey: `t-${stamp}-g1` });
  const insuf = await unlockLead({ vendorId: vendors[1].id, leadId: lead.id, idempotencyKey: `t-${stamp}-u1` });
  console.log("insufficient result:", insuf);
  if (insuf.ok || insuf.reason !== "insufficient_credits") throw new Error("FAIL insufficient");

  // 3. Vendor 0 unlocks (100→60)
  const u0 = await unlockLead({ vendorId: vendors[0].id, leadId: lead.id, idempotencyKey: `t-${stamp}-u0` });
  console.log("unlock:", u0);
  if (!u0.ok || u0.balance !== 60) throw new Error("FAIL unlock");

  // 4. Double unlock by same vendor blocked
  const dup = await unlockLead({ vendorId: vendors[0].id, leadId: lead.id, idempotencyKey: `t-${stamp}-u0b` });
  console.log("double-unlock result:", dup);
  if (dup.ok || dup.reason !== "already_unlocked") throw new Error("FAIL double");

  // 5. Top up vendor 1, unlock → lead has maxSlots=2 → EXHAUSTED
  await grantCredits({ vendorId: vendors[1].id, credits: 50, type: "BONUS", idempotencyKey: `t-${stamp}-g1b` });
  const u1 = await unlockLead({ vendorId: vendors[1].id, leadId: lead.id, idempotencyKey: `t-${stamp}-u1b` });
  const after = await prisma.lead.findUnique({ where: { id: lead.id } });
  console.log("second unlock:", u1, "lead status:", after?.status);
  if (!u1.ok || after?.status !== "EXHAUSTED") throw new Error("FAIL exhausted");

  // 6. Vendor 2 (not slotted) can't unlock
  const outsider = await unlockLead({ vendorId: vendors[2].id, leadId: lead.id, idempotencyKey: `t-${stamp}-u2` });
  console.log("outsider result:", outsider);
  if (outsider.ok) throw new Error("FAIL outsider");

  // 7. Ledger consistency: balanceAfter of latest entry == SUM(delta)
  for (const v of vendors) {
    const entries = await prisma.ledgerEntry.findMany({ where: { vendorId: v.id }, orderBy: { createdAt: "asc" } });
    const sum = entries.reduce((a, e) => a + e.deltaCredits, 0);
    const last = entries[entries.length - 1];
    console.log(`ledger check ${v.slug}: sum=${sum} lastBalanceAfter=${last?.balanceAfter}`);
    if (last && sum !== last.balanceAfter) throw new Error("FAIL ledger drift");
  }

  console.log("ALL CREDIT-PATH CHECKS PASSED");
}

main()
  .catch((e) => { console.error(e.message ?? e); process.exit(1); })
  .finally(() => prisma.$disconnect());
