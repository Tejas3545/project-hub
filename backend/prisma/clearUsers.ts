import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearUsers() {
  try {
    console.log('🔄 Starting to clear all users from database...');

    // Delete all users (this will cascade delete related data like bookmarks and progress)
    const result = await prisma.user.deleteMany({});

    console.log(`✅ Successfully deleted ${result.count} users from the database`);
    console.log('✨ User database cleared! Projects and domains remain intact.');
  } catch (error) {
    console.error('❌ Error clearing users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
