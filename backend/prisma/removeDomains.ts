import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDomains() {
  try {
    console.log('🔍 Checking current domains...');
    
    const allDomains = await prisma.domain.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            projects: true,
            githubProjects: true
          }
        }
      }
    });
    
    console.log('\nCurrent domains:');
    allDomains.forEach(domain => {
      console.log(`- ${domain.name} (${domain.slug}): ${domain._count.projects} projects, ${domain._count.githubProjects} GitHub projects`);
    });
    
    // Required domains per client specifications
    const requiredDomains = [
      'Web Development',
      'Artificial Intelligence',
      'Machine Learning',
      'Data Science',
      'Cybersecurity'
    ];
    
    // Find domains to remove
    const domainsToRemove = allDomains.filter(
      domain => !requiredDomains.includes(domain.name)
    );
    
    if (domainsToRemove.length === 0) {
      console.log('\n✅ No extra domains to remove. Only required domains exist.');
      return;
    }
    
    console.log('\n⚠️  Domains to remove:');
    domainsToRemove.forEach(domain => {
      console.log(`- ${domain.name} (${domain.slug})`);
    });
    
    // Remove domains (this will fail if they have projects due to foreign key constraints)
    for (const domain of domainsToRemove) {
      try {
        await prisma.domain.delete({
          where: { id: domain.id }
        });
        console.log(`✅ Removed domain: ${domain.name}`);
      } catch (error: any) {
        console.error(`❌ Failed to remove ${domain.name}:`, error.message);
        console.log(`   Checking for associated projects...`);
        
        // Check what's preventing deletion
        const projects = await prisma.project.count({
          where: { domainId: domain.id }
        });
        const githubProjects = await prisma.gitHubProject.count({
          where: { domainId: domain.id }
        });
        
        if (projects > 0 || githubProjects > 0) {
          console.log(`   Domain has ${projects} projects and ${githubProjects} GitHub projects`);
          console.log(`   These need to be reassigned or deleted first.`);
        }
      }
    }
    
    console.log('\n✅ Domain cleanup completed!');
    
  } catch (error) {
    console.error('Error removing domains:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDomains();
