const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔍 Testing database connection...');
console.log('📍 Database host:', process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'unknown');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Try a simple query
    console.log('⏳ Testing query...');
    const userCount = await prisma.user.count();
    console.log(`✅ Query successful! Found ${userCount} users in database`);
    
    await prisma.$disconnect();
    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('\n📋 Troubleshooting steps:');
    console.error('1. Verify your Supabase project is active at https://supabase.com/dashboard');
    console.error('2. Check if the password is correct (Tejas26475881)');
    console.error('3. Verify the database URL in .env file');
    console.error('4. Check if your IP is allowed (Supabase > Settings > Database > Connection pooling)');
    console.error('5. Try using the connection pooling URL from Supabase dashboard');
    process.exit(1);
  }
}

testConnection();
