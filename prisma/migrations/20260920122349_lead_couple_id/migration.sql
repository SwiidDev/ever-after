-- DropForeignKey
ALTER TABLE "MessageThread" DROP CONSTRAINT "MessageThread_coupleId_fkey";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "coupleId" TEXT;

-- AlterTable
ALTER TABLE "MessageThread" ALTER COLUMN "coupleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE SET NULL ON UPDATE CASCADE;
