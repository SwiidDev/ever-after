import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/** Credit cost per unlock, by category (ZAR credits; 1 credit = R30). */
const UNLOCK_COST: Record<string, number> = {
  Venues: 40,
  "Catering & Bar": 30,
  "Photography & Video": 20,
  "Flowers & Decor": 15,
  "Dresses & Suits": 15,
  "Hair & Makeup": 10,
  "Health & Beauty": 8,
  "Dance Lessons": 5,
  Honeymoon: 20,
};
export const unlockCost = (category: string) => UNLOCK_COST[category] ?? 10;

/**
 * Grant credits — append-only ledger entry. Idempotent via idempotencyKey.
 */
export async function grantCredits(opts: {
  vendorId: string;
  credits: number;
  type: "PURCHASE" | "BONUS" | "REFUND" | "ADMIN_ADJUSTMENT";
  idempotencyKey: string;
  refId?: string;
  note?: string;
}): Promise<{ ok: boolean; balance?: number; reason?: string }> {
  return prisma.$transaction(
    async (tx) => {
      const dup = await tx.ledgerEntry.findUnique({
        where: { idempotencyKey: opts.idempotencyKey },
      });
      if (dup) return { ok: true, balance: dup.balanceAfter };

      await tx.$queryRaw`
        SELECT id FROM "Vendor" WHERE id = ${opts.vendorId} FOR UPDATE`;
      const rows = await tx.$queryRaw<{ balance: number }[]>`
        SELECT COALESCE(SUM("deltaCredits"), 0)::int AS balance
        FROM "LedgerEntry" WHERE "vendorId" = ${opts.vendorId}`;
      const balance = rows[0].balance + opts.credits;

      const entry = await tx.ledgerEntry.create({
        data: {
          vendorId: opts.vendorId,
          type: opts.type,
          deltaCredits: opts.credits,
          balanceAfter: balance,
          idempotencyKey: opts.idempotencyKey,
          refId: opts.refId,
          note: opts.note,
        },
      });
      await tx.vendor.update({
        where: { id: opts.vendorId },
        data: { creditBalance: balance },
      });
      return { ok: true, balance: entry.balanceAfter };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

/**
 * Atomically spend credits to unlock a lead.
 * Guarantees: no double unlock per vendor/lead (DB unique), no negative
 * balance (serializable tx + re-check), no unlock beyond lead.maxSlots,
 * idempotent retries via idempotencyKey.
 */
export async function unlockLead(opts: {
  vendorId: string;
  leadId: string;
  idempotencyKey: string;
}): Promise<
  | { ok: true; balance: number }
  | { ok: false; reason: "already_unlocked" | "insufficient_credits" | "exhausted" | "not_distributed" }
> {
  return prisma.$transaction(
    async (tx) => {
      const dup = await tx.ledgerEntry.findUnique({
        where: { idempotencyKey: opts.idempotencyKey },
      });
      if (dup)
        return { ok: true as const, balance: dup.balanceAfter };

      // Serialize per vendor: re-read balance with lock
      // Lock the vendor row to serialize concurrent ledger mutations
      await tx.$queryRaw`
        SELECT id FROM "Vendor" WHERE id = ${opts.vendorId} FOR UPDATE`;
      const balRows = await tx.$queryRaw<{ balance: number }[]>`
        SELECT COALESCE(SUM("deltaCredits"), 0)::int AS balance
        FROM "LedgerEntry" WHERE "vendorId" = ${opts.vendorId}`;
      const balance = balRows[0].balance;

      const lead = await tx.lead.findUnique({
        where: { id: opts.leadId },
        include: { unlocks: true, slots: true },
      });
      if (!lead || lead.status !== "DISTRIBUTED")
        return { ok: false as const, reason: "not_distributed" };
      if (lead.unlocks.length >= lead.maxSlots)
        return { ok: false as const, reason: "exhausted" };
      const hasSlot = lead.slots.some((s) => s.vendorId === opts.vendorId);
      if (!hasSlot) return { ok: false as const, reason: "not_distributed" };
      if (lead.unlocks.some((u) => u.vendorId === opts.vendorId))
        return { ok: false as const, reason: "already_unlocked" };

      const cost = unlockCost(lead.category);
      if (balance < cost)
        return { ok: false as const, reason: "insufficient_credits" };

      const entry = await tx.ledgerEntry.create({
        data: {
          vendorId: opts.vendorId,
          type: "UNLOCK",
          deltaCredits: -cost,
          balanceAfter: balance - cost,
          idempotencyKey: opts.idempotencyKey,
          refId: opts.leadId,
        },
      });
      await tx.leadUnlock.create({
        data: {
          leadId: opts.leadId,
          vendorId: opts.vendorId,
          ledgerEntryId: entry.id,
        },
      });
      const newCount = lead.unlocks.length + 1;
      await tx.lead.update({
        where: { id: opts.leadId },
        data: {
          status: newCount >= lead.maxSlots ? "EXHAUSTED" : "DISTRIBUTED",
        },
      });
      await tx.vendor.update({
        where: { id: opts.vendorId },
        data: { creditBalance: balance - cost },
      });
      return { ok: true as const, balance: balance - cost };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
