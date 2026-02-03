-- CreateTable
CREATE TABLE "github_projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "liveUrl" TEXT,
    "domainId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT,
    "techStack" TEXT[],
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "topics" TEXT[],
    "lastUpdated" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "github_projects_domainId_idx" ON "github_projects"("domainId");

-- CreateIndex
CREATE INDEX "github_projects_difficulty_idx" ON "github_projects"("difficulty");

-- CreateIndex
CREATE INDEX "github_projects_stars_idx" ON "github_projects"("stars");

-- CreateIndex
CREATE INDEX "github_projects_isActive_idx" ON "github_projects"("isActive");

-- AddForeignKey
ALTER TABLE "github_projects" ADD CONSTRAINT "github_projects_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
