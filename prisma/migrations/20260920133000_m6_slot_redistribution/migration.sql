-- M6: slot lifecycle for response-time badges + auto-redistribution
-- Adds LeadSlotStatus enum, LeadSlot.status/notifiedAt/expiredAt, Lead.fulfilledAt
-- See src/lib/slots.ts for the redistribution logic

CREATE TYPE "LeadSlotStatus" AS ENUM ('PENDING', 'UNLOCKED', 'EXPIRED');

ALTER TABLE "LeadSlot"
  ADD COLUMN "notifiedAt" TIMESTAMP(3),
  ADD COLUMN "expiredAt" TIMESTAMP(3),
  ADD COLUMN "status" "LeadSlotStatus" NOT NULL DEFAULT 'PENDING';

ALTER TABLE "Lead"
  ADD COLUMN "fulfilledAt" TIMESTAMP(3);
