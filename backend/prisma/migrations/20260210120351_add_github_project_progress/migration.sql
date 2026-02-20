-- CreateTable
CREATE TABLE "github_project_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubProjectId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "checklist" BOOLEAN[] DEFAULT ARRAY[]::BOOLEAN[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_project_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "github_project_progress_userId_idx" ON "github_project_progress"("userId");

-- CreateIndex
CREATE INDEX "github_project_progress_githubProjectId_idx" ON "github_project_progress"("githubProjectId");

-- CreateIndex
CREATE INDEX "github_project_progress_status_idx" ON "github_project_progress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "github_project_progress_userId_githubProjectId_key" ON "github_project_progress"("userId", "githubProjectId");

-- AddForeignKey
ALTER TABLE "github_project_progress" ADD CONSTRAINT "github_project_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_project_progress" ADD CONSTRAINT "github_project_progress_githubProjectId_fkey" FOREIGN KEY ("githubProjectId") REFERENCES "github_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
