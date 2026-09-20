/**
 * Verify the slot-lifecycle: expire + redistribute.
 * Stages:
 *   1) Make 3 vendors, 1 lead with 1 slot for vendor A, manually age it.
 *   2) Grant credits to vendor B; run expireAndRedistribute with cutoff=now.
 *   3) Expect slot A EXPIRED, fresh slot B PENDING.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const stamp = Date.now();

async function main() {
  const cat = "Venues";
  const couples = await Promise.all(
    Array.from({ length: 3 }, async (_, i) => {
      const u = await prisma.user.create({
        data: { email: `sl${stamp}-${i}@t.local`, role: "COUPLE" },
      });
      return prisma.couple.create({ data: { userId: u.id } });
    }),
  );
  const leads: { id: string }[] = [];
  const vendors: { id: string }[] = [];
  for (let i = 0; i < 3; i++) {
    const u = await prisma.user.create({
      data: { email: `sl${stamp}-v${i}@t.local`, role: "VENDOR" },
    });
    const v = await prisma.vendor.create({
      data: {
        userId: u.id,
        businessName: `SlotVendor${i}`,
        slug: `sl${stamp}-v${i}`,
        category: cat,
        baseRegion: "Pretoria",
        status: "APPROVED",
      },
    });
    vendors.push(v);
  }
  const lead = await prisma.lead.create({
    data: {
      coupleId: couples[0].id,
      category: cat,
      region: "Pretoria",
      budgetBand: "R80,000+",
      contactName: "Slot",
      contactEmail: "slot@t.local",
      contactPhone: "0",
    },
  });
  leads.push(lead);
  await prisma.leadSlot.create({
    data: {
      leadId: lead.id,
      vendorId: vendors[0].id,
      position: 1,
      status: "PENDING",
      notified: true,
      notifiedAt: new Date(Date.now() - 48 * 3600 * 1000),
    },
  });

  const { expireAndRedistribute } = await import("../src/lib/slots");
  const result = await expireAndRedistribute();
  console.log("result:", result);

  const slots = await prisma.leadSlot.findMany({
    where: { leadId: lead.id },
    orderBy: { position: "asc" },
  });
  const pending = slots.filter((s) => s.status === "PENDING");
  const expired = slots.filter((s) => s.status === "EXPIRED");
  if (expired.length !== 1) throw new Error("FAIL: expected 1 EXPIRED slot");
  if (pending.length !== 1) throw new Error("FAIL: expected 1 fresh PENDING slot");
  if (pending[0].vendorId === expired[0].vendorId)
    throw new Error("FAIL: redistributed to same vendor");
  if (pending[0].vendorId !== vendors[1].id && pending[0].vendorId !== vendors[2].id)
    throw new Error(
      `FAIL: redistributed to unexpected vendor ${pending[0].vendorId}`,
    );
  console.log("ALL SLOT-LIFECYCLE CHECKS PASSED");
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
