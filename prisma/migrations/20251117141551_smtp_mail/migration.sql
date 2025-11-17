/*
  Warnings:

  - The `smtpPort` column on the `Credential` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "smtpPassword" TEXT,
ADD COLUMN     "smtpUser" TEXT,
DROP COLUMN "smtpPort",
ADD COLUMN     "smtpPort" INTEGER;
