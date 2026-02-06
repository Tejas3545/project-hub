const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function testGitHubProjects() {
  try {
    console.log('🔍 Testing GitHubProject queries...\n');
    
    // Test 1: Count all GitHubProjects
    const count = await prisma.gitHubProject.count();
    console.log(`✅ Total GitHubProjects in database: ${count}`);
    
    // Test 2: Get domains
    const domains = await prisma.domain.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log(`✅ Found ${domains.length} domains:`);
    domains.forEach(d => console.log(`   - ${d.name} (${d.slug})`));
    
    // Test 3: Try to fetch projects for artificial-intelligence domain
    const aiDomain = domains.find(d => d.slug === 'artificial-intelligence');
    if (aiDomain) {
      console.log(`\n🔍 Querying projects for ${aiDomain.name}...`);
      const projects = await prisma.gitHubProject.findMany({
        where: {
          isActive: true,
          domain: { slug: 'artificial-intelligence' }
        },
        take: 5,
        include: {
          domain: {
            select: { id: true, name: true, slug: true }
          }
        }
      });
      console.log(`✅ Found ${projects.length} active projects for AI domain`);
      if (projects.length > 0) {
        console.log(`   First project: ${projects[0].title}`);
      }
    } else {
      console.log('❌ AI domain not found!');
    }
    
    await prisma.$disconnect();
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testGitHubProjects();
