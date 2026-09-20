-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('DISTRIBUTED', 'EXHAUSTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('PURCHASE', 'BONUS', 'UNLOCK', 'REFUND', 'ADMIN_ADJUSTMENT', 'EXPIRY');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "region" TEXT NOT NULL,
    "budgetBand" TEXT NOT NULL,
    "guestCount" INTEGER,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "notes" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'DISTRIBUTED',
    "maxSlots" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSlot" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadUnlock" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "ledgerEntryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" "LedgerType" NOT NULL,
    "deltaCredits" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "refId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditBundle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CreditBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "bundleId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "pfPaymentId" TEXT,
    "creditsGranted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadSlot_leadId_vendorId_key" ON "LeadSlot"("leadId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadUnlock_ledgerEntryId_key" ON "LeadUnlock"("ledgerEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadUnlock_leadId_vendorId_key" ON "LeadUnlock"("leadId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_idempotencyKey_key" ON "LedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "LedgerEntry_vendorId_createdAt_idx" ON "LedgerEntry"("vendorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_pfPaymentId_key" ON "Payment"("pfPaymentId");

-- AddForeignKey
ALTER TABLE "LeadSlot" ADD CONSTRAINT "LeadSlot_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSlot" ADD CONSTRAINT "LeadSlot_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadUnlock" ADD CONSTRAINT "LeadUnlock_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadUnlock" ADD CONSTRAINT "LeadUnlock_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
