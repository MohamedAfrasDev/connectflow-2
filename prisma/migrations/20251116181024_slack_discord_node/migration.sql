/*
  Warnings:

  - The values [DISCORD,SLACK] on the enum `CredentialType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CredentialType_new" AS ENUM ('OPENAI', 'ANTHROPIC', 'GEMINI', 'DEEPSEEK', 'PERPLEXITY');
ALTER TABLE "Credential" ALTER COLUMN "type" TYPE "CredentialType_new" USING ("type"::text::"CredentialType_new");
ALTER TYPE "CredentialType" RENAME TO "CredentialType_old";
ALTER TYPE "CredentialType_new" RENAME TO "CredentialType";
DROP TYPE "public"."CredentialType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'DISCORD';
ALTER TYPE "NodeType" ADD VALUE 'SLACK';
