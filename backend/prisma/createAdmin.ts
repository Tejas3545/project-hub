import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating Admin User...\n');

    const adminEmail = 'admin@projecthub.com';
    const adminPassword = 'Admin@123';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('\n💡 If you forgot the password, update it in Supabase dashboard or delete this user and run the script again.\n');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isVerified: true,
      },
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    ', adminEmail);
    console.log('🔑 Password: ', adminPassword);
    console.log('👤 Role:     ', admin.role);
    console.log('═══════════════════════════════════════');
    console.log('\n🚀 You can now login at: http://localhost:3000/login');
    console.log('📊 Admin Panel: http://localhost:3000/admin');
    console.log('👥 User Management: http://localhost:3000/admin/users\n');
    console.log('⚠️  IMPORTANT: Change this password after first login!\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
