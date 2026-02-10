import { PrismaClient } from '@prisma/client';

// Real Prisma client connected to database
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection
prisma.$connect()
    .then(() => {
        console.log('✅ Database connected successfully');
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error.message);
        console.error('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'));
        process.exit(1);
    });

export default prisma;
