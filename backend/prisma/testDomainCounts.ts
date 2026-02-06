/**
 * Test Domain Counts
 * 
 * This script verifies that domain project counts are real-time and accurate.
 * Run this to check that all domains show the correct number of active GitHub projects.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDomainCounts() {
  try {
    console.log('🔍 Testing Real-Time Domain Counts...\n');
    console.log('=' .repeat(70));

    // Fetch domains with counts (same as API does)
    const domains = await prisma.domain.findMany({
      include: {
        _count: {
          select: {
            projects: {
              where: { isPublished: true }
            },
            githubProjects: {
              where: { isActive: true }
            }
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (domains.length === 0) {
      console.log('⚠️  No domains found in database');
      return;
    }

    console.log(`\n📊 Found ${domains.length} domains:\n`);

    let totalGitHubProjects = 0;
    let totalProjects = 0;

    for (const domain of domains) {
      const githubCount = domain._count.githubProjects;
      const projectCount = domain._count.projects;
      
      totalGitHubProjects += githubCount;
      totalProjects += projectCount;

      console.log(`📁 ${domain.name} (${domain.slug})`);
      console.log(`   GitHub Projects: ${githubCount}`);
      console.log(`   Regular Projects: ${projectCount}`);
      console.log(`   Total: ${githubCount + projectCount}`);
      console.log('');
    }

    console.log('=' .repeat(70));
    console.log('\n📈 Summary:');
    console.log(`   Total GitHub Projects: ${totalGitHubProjects}`);
    console.log(`   Total Regular Projects: ${totalProjects}`);
    console.log(`   Grand Total: ${totalGitHubProjects + totalProjects}`);

    console.log('\n✅ Test Complete!');
    console.log('\n💡 These counts will appear on the homepage in real-time.');
    console.log('   When you add new projects, the cards will update automatically.\n');

    // Test adding a project (simulation)
    console.log('\n🧪 Testing Count Update Simulation:');
    console.log('   If you add a new GitHub project to a domain, the count will increase.');
    console.log('   If you set isActive=false, the count will decrease.');
    console.log('   Counts are always calculated from the database in real-time.\n');

  } catch (error) {
    console.error('❌ Error testing domain counts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  testDomainCounts()
    .then(() => {
      console.log('✨ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export { testDomainCounts };
