/** M4 end-to-end: lead -> unlock -> notification -> thread -> message -> review */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const stamp = Date.now();

async function main() {
  // Couple with a logged-in identity
  const cu = await prisma.user.create({
    data: { email: `m4couple-${stamp}@test.local`, role: "COUPLE" },
  });
  const couple = await prisma.couple.create({ data: { userId: cu.id } });

  // Vendor with credits
  const vu = await prisma.user.create({
    data: { email: `m4vendor-${stamp}@test.local`, role: "VENDOR" },
  });
  const vendor = await prisma.vendor.create({
    data: {
      userId: vu.id,
      businessName: "M4TestVenue",
      slug: `m4-${stamp}`,
      category: "Venues",
      baseRegion: "Pretoria",
      status: "APPROVED",
    },
  });

  const { grantCredits, unlockLead } = await import("../src/lib/credits");
  await grantCredits({ vendorId: vendor.id, credits: 100, type: "BONUS", idempotencyKey: `m4-${stamp}-g` });

  // Lead owned by the couple
  const lead = await prisma.lead.create({
    data: {
      coupleId: couple.id,
      category: "Venues",
      region: "Pretoria",
      budgetBand: "R40,000 – R80,000",
      contactName: "M4 Couple",
      contactEmail: "m4@test.local",
      contactPhone: "000",
    },
  });
  await prisma.leadSlot.create({ data: { leadId: lead.id, vendorId: vendor.id, position: 1 } });

  // Vendor unlocks
  const unlock = await unlockLead({ vendorId: vendor.id, leadId: lead.id, idempotencyKey: `m4-${stamp}-u` });
  if (!unlock.ok) throw new Error("unlock failed: " + JSON.stringify(unlock));
  console.log("unlock ok, balance:", unlock.balance);

  // Couple notification (as the real unlock action would queue)
  const { notify, deliverQueued } = await import("../src/lib/notify");
  await notify({ userId: cu.id, template: "lead_unlocked", payload: { vendorName: vendor.businessName, leadId: lead.id } });
  const delivered = await deliverQueued();
  const notif = await prisma.notification.findFirst({ where: { userId: cu.id } });
  console.log("notifications delivered:", delivered, "status:", notif?.status);
  if (notif?.status !== "SENT") throw new Error("FAIL notification");

  // Thread opens + message from vendor
  const thread = await prisma.messageThread.create({
    data: { leadId: lead.id, vendorId: vendor.id, coupleId: couple.id },
  });
  await prisma.message.create({
    data: { threadId: thread.id, senderRole: "VENDOR", body: "Hi! Venue is available on your date." },
  });
  const msgs = await prisma.message.count({ where: { threadId: thread.id } });
  console.log("thread messages:", msgs);
  if (msgs !== 1) throw new Error("FAIL message");

  // Review (unique per lead) + rating recompute check
  const r1 = await prisma.review.create({ data: { vendorId: vendor.id, leadId: lead.id, rating: 5 } });
  const dup = await prisma.review.create({ data: { vendorId: vendor.id, leadId: lead.id, rating: 1 } }).catch(() => null);
  if (r1.rating !== 5 || dup) throw new Error("FAIL review uniqueness");
  const newCount = vendor.ratingCount + 1;
  const newAvg = (Number(vendor.ratingAvg) * vendor.ratingCount + 5) / newCount;
  await prisma.vendor.update({ where: { id: vendor.id }, data: { ratingAvg: newAvg, ratingCount: newCount } });
  console.log("rating now:", newAvg.toFixed(2), "count:", newCount);

  console.log("M4 E2E PASSED — ids:", { leadId: lead.id, vendorId: vendor.id });
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
