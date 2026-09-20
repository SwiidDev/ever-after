import { prisma } from "@/lib/prisma";

/**
 * Quick-responder scoring for vendor cards + profiles.
 * - quickResponder = true when average unlock response time across the
 *   vendor's last UNLOCKED slots (≤ N) is under QUICK_THRESHOLD_MIN minutes.
 * - responseCount = total unlocked slots (used as confidence).
 * - Empty / sparse data → conservative defaults (no badge, count 0).
 */

const SAMPLE_SIZE = 20;
const QUICK_THRESHOLD_MIN = 60;

export type VendorBadge = {
  quickResponder: boolean;
  averageResponseMinutes: number | null;
  responseCount: number;
};

export async function vendorBadge(vendorId: string): Promise<VendorBadge> {
  const recent = await prisma.leadUnlock.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
    take: SAMPLE_SIZE,
    select: {
      createdAt: true,
      lead: { select: { slots: { where: { vendorId }, take: 1, select: { notifiedAt: true } } } },
    },
  });
  const minutes = recent
    .map((u) => {
      const notifiedAt = u.lead.slots[0]?.notifiedAt;
      if (!notifiedAt) return null;
      return (u.createdAt.getTime() - notifiedAt.getTime()) / 60_000;
    })
    .filter((n): n is number => typeof n === "number" && n >= 0);
  if (minutes.length === 0) {
    return { quickResponder: false, averageResponseMinutes: null, responseCount: 0 };
  }
  const avg = minutes.reduce((a, b) => a + b, 0) / minutes.length;
  return {
    quickResponder: avg <= QUICK_THRESHOLD_MIN,
    averageResponseMinutes: Math.round(avg),
    responseCount: recent.length,
  };
}
