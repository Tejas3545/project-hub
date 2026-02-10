import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function check() {
  const counts = await p.gitHubProject.groupBy({
    by: ['domainId'],
    _count: true,
  });
  
  console.log('Projects per domain:');
  for (const c of counts) {
    const d = await p.domain.findUnique({ where: { id: c.domainId } });
    console.log(`  ${d ? d.name : c.domainId}: ${c._count}`);
  }
  
  const total = await p.gitHubProject.count();
  console.log(`\nTotal projects: ${total}`);
  await p.$disconnect();
}

check();
