import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDomainCounts() {
    console.log('--- Domain-wise Project Allocation Check ---');

    const domains = await prisma.domain.findMany({
        include: {
            _count: {
                select: { githubProjects: true }
            }
        }
    });

    let total = 0;
    domains.forEach(d => {
        console.log(`${d.name} (${d.slug}): ${d._count.githubProjects} projects`);
        total += d._count.githubProjects;

        if (d._count.githubProjects !== 200) {
            const diff = 200 - d._count.githubProjects;
            if (diff > 0) {
                console.warn(`  ⚠️ Missing ${diff} projects to reach 200.`);
            } else {
                console.warn(`  ⚠️ Over by ${Math.abs(diff)} projects. Needs pruning.`);
            }
        } else {
            console.log(`  ✅ Perfect allocation (200/200).`);
        }
    });

    console.log('-------------------------------------------');
    console.log(`Total Projects: ${total}`);
    console.log('Target: 1000 Projects (200 per domain)');
}

checkDomainCounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
