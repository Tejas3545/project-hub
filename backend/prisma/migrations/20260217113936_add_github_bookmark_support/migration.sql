/*
  Warnings:

  - A unique constraint covering the columns `[userId,githubProjectId]` on the table `bookmarks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bookmarks" ADD COLUMN     "githubProjectId" TEXT,
ALTER COLUMN "projectId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "bookmarks_githubProjectId_idx" ON "bookmarks"("githubProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_githubProjectId_key" ON "bookmarks"("userId", "githubProjectId");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_githubProjectId_fkey" FOREIGN KEY ("githubProjectId") REFERENCES "github_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
