import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearNonAdminUsers() {
  try {
    console.log('🔄 Starting user cleanup...');

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log(`📊 Total users found: ${allUsers.length}`);

    // Find admin users
    const adminUsers = allUsers.filter(user => user.role === 'ADMIN');
    console.log(`👑 Admin users: ${adminUsers.length}`);
    adminUsers.forEach(admin => console.log(`  - ${admin.email}`));

    // Find non-admin users to delete
    const nonAdminUsers = allUsers.filter(user => user.role !== 'ADMIN');
    console.log(`\n🗑️  Non-admin users to delete: ${nonAdminUsers.length}`);

    if (nonAdminUsers.length === 0) {
      console.log('✅ No non-admin users to delete');
      return;
    }

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will delete the following users:');
    nonAdminUsers.forEach(user => console.log(`  - ${user.email} (ID: ${user.id})`));
    console.log('\n👉 To proceed with deletion, uncomment the delete line in the script.\n');

    // Uncomment the following line to actually delete the users:
    // const result = await prisma.user.deleteMany({
    //   where: {
    //     role: {
    //       not: 'ADMIN'
    //     }
    //   }
    // });
    // console.log(`\n✅ Deleted ${result.count} non-admin users`);

    console.log('\n✅ User cleanup completed (dry run mode)');
    console.log('💡 Uncomment the delete statement in the script to actually delete users');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearNonAdminUsers()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
