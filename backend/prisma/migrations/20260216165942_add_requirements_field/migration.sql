-- AlterTable
ALTER TABLE "github_projects" ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requirementsText" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requirementsText" TEXT;
