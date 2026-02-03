import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSlugs() {
    const domains = await prisma.domain.findMany();
    console.log('Domain slugs:', domains.map(d => d.slug));
    await prisma.$disconnect();
}

checkSlugs();
