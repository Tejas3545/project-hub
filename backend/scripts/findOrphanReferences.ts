import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({ select: { id: true } });
  const projectIds = new Set(projects.map(p => p.id));

  console.log(`Known project IDs: ${projects.length}`);

  const progress = await prisma.projectProgress.findMany({ select: { id: true, projectId: true, userId: true } });
  const orphanProgress = progress.filter(p => !p.projectId || !projectIds.has(p.projectId));
  console.log(`Orphan projectProgress count: ${orphanProgress.length}`);
  orphanProgress.forEach(p => console.log('projectProgress orphan:', p.id, p.projectId, p.userId));

  const likes = await prisma.like.findMany({ select: { id: true, projectId: true, userId: true } });
  const orphanLikes = likes.filter(l => !l.projectId || !projectIds.has(l.projectId));
  console.log(`Orphan likes count: ${orphanLikes.length}`);
  orphanLikes.forEach(l => console.log('like orphan:', l.id, l.projectId, l.userId));

  const bookmarks = await prisma.bookmark.findMany({ select: { id: true, projectId: true, userId: true } });
  const orphanBookmarks = bookmarks.filter(b => !b.projectId || !projectIds.has(b.projectId));
  console.log(`Orphan bookmarks count: ${orphanBookmarks.length}`);
  orphanBookmarks.forEach(b => console.log('bookmark orphan:', b.id, b.projectId, b.userId));

  const comments = await prisma.comment.findMany({ select: { id: true, projectId: true, userId: true } });
  const orphanComments = comments.filter(c => !c.projectId || !projectIds.has(c.projectId));
  console.log(`Orphan comments count: ${orphanComments.length}`);
  orphanComments.forEach(c => console.log('comment orphan:', c.id, c.projectId, c.userId));
}

main().catch(err => { console.error(err); process.exit(1); }).finally(async () => { await prisma.$disconnect(); process.exit(0); });
