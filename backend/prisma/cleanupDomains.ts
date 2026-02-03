import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDomains() {
  console.log('🗑️  Removing unnecessary domains and their projects...\n');
  
  // Keep only these 5 domains
  const keepDomains = [
    'web-development',
    'artificial-intelligence',
    'machine-learning',
    'data-science',
    'cybersecurity'
  ];
  
  // Get all domains
  const allDomains = await prisma.domain.findMany();
  
  // Delete domains and their projects that are not in the keep list
  for (const domain of allDomains) {
    if (!keepDomains.includes(domain.slug)) {
      console.log(`❌ Deleting domain: ${domain.name} (${domain.slug})`);
      
      // Delete associated projects first
      const projectsDeleted = await prisma.gitHubProject.deleteMany({
        where: { domainId: domain.id }
      });
      console.log(`   Deleted ${projectsDeleted.count} projects`);
      
      // Delete the domain
      await prisma.domain.delete({
        where: { id: domain.id }
      });
    } else {
      console.log(`✅ Keeping domain: ${domain.name} (${domain.slug})`);
    }
  }
  
  console.log('\n✅ Cleanup complete!');
  console.log('\nRemaining domains:');
  
  const remaining = await prisma.domain.findMany();
  for (const domain of remaining) {
    const count = await prisma.gitHubProject.count({ where: { domainId: domain.id } });
    console.log(`  ${domain.name}: ${count} projects`);
  }
  
  await prisma.$disconnect();
}

cleanupDomains();
