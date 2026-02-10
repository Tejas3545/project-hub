const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if test user exists
    const existing = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existing) {
      console.log('✅ Test user already exists');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      return;
    }

    // Create test user
    const passwordHash = await bcrypt.hash('password123', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash,
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
        isVerified: true,
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('User ID:', user.id);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
