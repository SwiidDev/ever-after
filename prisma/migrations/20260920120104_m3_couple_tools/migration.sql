-- CreateEnum
CREATE TYPE "Event" AS ENUM ('WEDDING', 'BRIDAL_SHOWER', 'BACHELORS');

-- CreateEnum
CREATE TYPE "Rsvp" AS ENUM ('PENDING', 'ATTENDING', 'DECLINED');

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "event" "Event" NOT NULL DEFAULT 'WEDDING',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "rsvp" "Rsvp" NOT NULL DEFAULT 'PENDING',
    "needsRoom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedCents" INTEGER NOT NULL,
    "actualCents" INTEGER NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "monthsOut" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Guest_coupleId_event_idx" ON "Guest"("coupleId", "event");

-- CreateIndex
CREATE INDEX "BudgetItem_coupleId_category_idx" ON "BudgetItem"("coupleId", "category");

-- CreateIndex
CREATE INDEX "ChecklistItem_coupleId_monthsOut_idx" ON "ChecklistItem"("coupleId", "monthsOut");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;
