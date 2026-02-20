-- CreateEnum
CREATE TYPE "QaStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REWORK');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Difficulty" ADD VALUE 'BEGINNER';
ALTER TYPE "Difficulty" ADD VALUE 'INTERMEDIATE';
ALTER TYPE "Difficulty" ADD VALUE 'ADVANCED';

-- AlterTable
ALTER TABLE "github_projects" ADD COLUMN     "qaFeedback" TEXT,
ADD COLUMN     "qaStatus" "QaStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT;
