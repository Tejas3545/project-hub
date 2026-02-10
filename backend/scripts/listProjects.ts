import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.project.count();
  console.log(`Total projects: ${total}`);
  const projects = await prisma.project.findMany({ select: { id: true, title: true }, take: 200 });
  projects.forEach(p => console.log(p.id, '-', p.title));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
