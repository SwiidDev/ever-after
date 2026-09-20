/*
  Warnings:

  - Added the required column `category` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "category" TEXT NOT NULL;
