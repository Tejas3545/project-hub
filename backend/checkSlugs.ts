import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSlugs() {
    try {
        // Use batched pagination to avoid memory issues with large tables
        const BATCH_SIZE = 100;
        let lastId = '';
        let allDomains: any[] = [];
        
        while (true) {
            const batch = await prisma.domain.findMany({
                take: BATCH_SIZE,
                ...(lastId ? { skip: 1, cursor: { id: lastId } } : {}),
                orderBy: { id: 'asc' }
            });
            
            if (batch.length === 0) break;
            
            allDomains = allDomains.concat(batch);
            lastId = batch[batch.length - 1].id;
            
            if (batch.length < BATCH_SIZE) break;
        }
        
        console.log('Domain slugs:', allDomains.map(d => d.slug));
    } catch (error) {
        console.error('Error checking slugs:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

checkSlugs().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
