-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "minTime" INTEGER NOT NULL,
    "maxTime" INTEGER NOT NULL,
    "skillFocus" TEXT[],
    "industryContext" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "prerequisites" TEXT[],
    "deliverables" TEXT[],
    "advancedExtensions" TEXT,
    "evaluationCriteria" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domains_name_key" ON "domains"("name");

-- CreateIndex
CREATE UNIQUE INDEX "domains_slug_key" ON "domains"("slug");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
