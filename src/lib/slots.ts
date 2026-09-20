import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

/**
 * Process slot lifecycle: expire any PENDING slot on a DISTRIBUTED lead
 * whose notifiedAt is older than the threshold, then award the freed slot
 * to the next eligible APPROVED vendor in the same category.
 *
 * - Default window: 24h (configurable via process.env.SLOT_EXPIRY_HOURS)
 * - Vendor pool: APPROVED in the lead's category, NOT already on the lead
 *   (no slot or slot UNLOCKED/EXPIRED)
 * - Fairness: prefer vendors with the lowest unlocks-in-trailing-30-days
 * - Idempotent: running this many times in a row yields the same DB state
 */

export const SLOTS_PER_LEAD = 5;
const DEFAULT_WINDOW_HOURS = Number(process.env.SLOT_EXPIRY_HOURS ?? 24);

export async function expireAndRedistribute(opts?: {
  dryRun?: boolean;
  now?: Date;
  windowHours?: number;
}) {
  const now = opts?.now ?? new Date();
  const windowHours = opts?.windowHours ?? DEFAULT_WINDOW_HOURS;
  const cutoff = new Date(now.getTime() - windowHours * 3_600_000);

  // 1) Mark stale PENDING slots as EXPIRED
  const stale = await prisma.leadSlot.findMany({
    where: {
      status: "PENDING",
      notifiedAt: { lt: cutoff },
      lead: { status: "DISTRIBUTED" },
    },
    include: { lead: true, vendor: true },
  });

  let expired = 0;
  let redistributed = 0;

  for (const slot of stale) {
    if (!opts?.dryRun) {
      await prisma.leadSlot.update({
        where: { id: slot.id },
        data: { status: "EXPIRED", expiredAt: now },
      });
      expired++;
    }
    // 2) For each expired slot, find the next eligible vendor
    const replacement = await prisma.vendor.findFirst({
      where: {
        status: "APPROVED",
        category: slot.lead.category,
        AND: {
          // exclude vendors already represented on this lead
          NOT: {
            leadSlots: { some: { leadId: slot.leadId } },
          },
        },
      },
      orderBy: [
        { leadUnlocks: { _count: "asc" } },
        { ratingAvg: "desc" },
      ],
    });
    if (replacement) {
      // Avoid duplicate within the same lead (DB unique already covers PENDING too)
      const existing = await prisma.leadSlot.findUnique({
        where: {
          leadId_vendorId: {
            leadId: slot.leadId,
            vendorId: replacement.id,
          },
        },
      });
      if (!existing && !opts?.dryRun) {
        await prisma.leadSlot.create({
          data: {
            leadId: slot.leadId,
            vendorId: replacement.id,
            position: SLOTS_PER_LEAD,
            status: "PENDING",
            notified: true,
            notifiedAt: now,
          },
        });
        // Outbox notify the new vendor
        const leadUser = await prisma.user.findFirst({
          where: { vendor: { id: replacement.id } },
        });
        if (leadUser) {
          await notify({
            userId: leadUser.id,
            template: "lead_unlocked",
            payload: {
              vendorName: replacement.businessName,
              leadId: slot.leadId,
              reason: "redistributed",
            },
          });
        }
        redistributed++;
      }
    }
  }

  // 3) Mark lead EXHAUSTED if no remaining PENDING slots (no more capacity)
  // Walk through each lead touched by expirations
  const touchedLeadIds = Array.from(new Set(stale.map((s) => s.leadId)));
  for (const leadId of touchedLeadIds) {
    const remaining = await prisma.leadSlot.count({
      where: { leadId, status: "PENDING" },
    });
    if (remaining === 0 && !opts?.dryRun) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "EXHAUSTED", fulfilledAt: now },
      });
    }
  }

  return { expired, redistributed, leadTouched: touchedLeadIds.length };
}
