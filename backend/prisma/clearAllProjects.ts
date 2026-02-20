/**
 * Clear all existing GitHub projects from the database
 * Run this before re-seeding with improved filtering
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllProjects() {
  console.log('🗑️  Clearing all GitHub projects from database...');
  
  try {
    // Delete all project progress records first (foreign key constraint)
    const progressDeleted = await prisma.projectProgress.deleteMany({});
    console.log(`  ✓ Deleted ${progressDeleted.count} project progress records`);
    
    // Delete all GitHub project bookmarks
    const bookmarksDeleted = await prisma.bookmark.deleteMany({
      where: {
        githubProjectId: { not: null }
      }
    });
    console.log(`  ✓ Deleted ${bookmarksDeleted.count} GitHub project bookmarks`);
    
    // Delete all GitHub projects
    const projectsDeleted = await prisma.gitHubProject.deleteMany({});
    console.log(`  ✓ Deleted ${projectsDeleted.count} GitHub projects`);
    
    console.log('\n✅ All projects cleared successfully!');
    console.log('📝 Ready to re-seed with improved filtering.\n');
    
  } catch (error) {
    console.error('❌ Error clearing projects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the clear function
clearAllProjects();
