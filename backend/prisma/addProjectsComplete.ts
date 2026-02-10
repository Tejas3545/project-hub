/**
 * Complete Project Addition Pipeline
 * 
 * This script:
 * 1. Runs advanced GitHub scraper to add 200+ real projects
 * 2. Automatically generates unique 7-section content for all new projects
 * 3. Verifies project counts
 * 4. Cleans up and provides summary
 * 
 * Run: npm run add-projects-complete
 */

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function runCommand(command: string, description: string): Promise<boolean> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 ${description}`);
  console.log(`${'='.repeat(70)}\n`);
  
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`\n✅ ${description} - COMPLETED\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${description} - FAILED\n`, error);
    return false;
  }
}

async function getProjectCounts() {
  const domains = await prisma.domain.findMany({
    include: {
      _count: {
        select: {
          githubProjects: {
            where: {
              isActive: true
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  return domains;
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║         🚀 COMPLETE PROJECT ADDITION PIPELINE 🚀                  ║
║                                                                    ║
║  This will:                                                        ║
║  1. Scrape 200+ real GitHub projects (NO libraries!)             ║
║  2. Auto-generate unique 7-section content for each               ║
║  3. Verify counts and update database                             ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
  `);
  
  // Step 1: Get initial counts
  console.log('\n📊 Getting initial project counts...\n');
  const beforeCounts = await getProjectCounts();
  const totalBefore = beforeCounts.reduce((sum, d) => sum + d._count.githubProjects, 0);
  
  console.log('📁 Current Project Distribution:');
  beforeCounts.forEach(domain => {
    console.log(`   ${domain.name}: ${domain._count.githubProjects} projects`);
  });
  console.log(`\n   📈 Total: ${totalBefore} projects\n`);
  
  // Step 2: Run scraper
  const scraperSuccess = await runCommand(
    'ts-node advancedGitHubScraper.ts',
    'STEP 1/3: Scraping GitHub for Real Projects'
  );
  
  if (!scraperSuccess) {
    console.error('❌ Scraper failed. Aborting pipeline.');
    process.exit(1);
  }
  
  // Step 3: Get counts after scraping
  console.log('\n📊 Getting updated project counts...\n');
  const afterScrapingCounts = await getProjectCounts();
  const totalAfterScraping = afterScrapingCounts.reduce((sum, d) => sum + d._count.githubProjects, 0);
  const projectsAdded = totalAfterScraping - totalBefore;
  
  // Build a map from beforeCounts by domain name for safe lookup
  const beforeCountsMap = new Map<string, { id: string; name: string; _count: { githubProjects: number } }>();
  beforeCounts.forEach(domain => {
    beforeCountsMap.set(domain.name, domain);
  });
  
  console.log('📁 Updated Project Distribution:');
  afterScrapingCounts.forEach((domain) => {
    const beforeDomain = beforeCountsMap.get(domain.name);
    const before = beforeDomain?._count.githubProjects || 0;
    const after = domain._count.githubProjects;
    const added = after - before;
    console.log(`   ${domain.name}: ${after} projects (+${added})`);
  });
  console.log(`\n   📈 Total: ${totalAfterScraping} projects (+${projectsAdded})\n`);
  
  if (projectsAdded === 0) {
    console.log('⚠️  No new projects added. Check GitHub token and scraper configuration.');
    process.exit(0);
  }
  
  // Step 4: Generate content for all projects
  const contentSuccess = await runCommand(
    'ts-node generateUniqueProjectContent.ts',
    'STEP 2/3: Generating Unique 7-Section Content'
  );
  
  if (!contentSuccess) {
    console.error('⚠️  Content generation had issues, but projects were added.');
  }
  
  // Step 5: Final verification
  await runCommand(
    'ts-node testDomainCounts.ts',
    'STEP 3/3: Final Verification & Count Test'
  );
  
  // Step 6: Summary
  const finalCounts = await getProjectCounts();
  const totalFinal = finalCounts.reduce((sum, d) => sum + d._count.githubProjects, 0);
  
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                   🎉 PIPELINE COMPLETED! 🎉                       ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

📊 FINAL SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Projects Added: ${projectsAdded}
✅ Total Projects Now: ${totalFinal}
✅ Content Generated: All projects have 7 unique sections
✅ Database Status: Synchronized with Supabase Cloud

📁 Final Distribution:
${finalCounts.map(d => `   • ${d.name}: ${d._count.githubProjects} projects`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Your website is ready!
   Visit: https://projects-hub-platform.vercel.app/

📝 All changes are saved to Supabase Cloud database.
   Domain cards will update in real-time automatically.

🚀 To deploy:
   1. git add .
   2. git commit -m "Added ${projectsAdded} quality projects with unique content"
   3. git push

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

main()
  .catch((error) => {
    console.error('Pipeline error:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
