-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "secure" BOOLEAN,
ADD COLUMN     "smtpHost" TEXT,
ADD COLUMN     "smtpPort" TEXT;
