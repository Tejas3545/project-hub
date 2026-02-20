import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function pruneTo200() {
    console.log('--- Pruning to Exact 200 Projects Per Domain ---');

    const domains = await prisma.domain.findMany({
        include: {
            githubProjects: {
                select: { id: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    for (const domain of domains) {
        const count = domain.githubProjects.length;
        if (count > 200) {
            const toRemove = count - 200;
            console.log(`Domain ${domain.name}: Pruning ${toRemove} projects...`);

            // Get the oldest 'toRemove' projects (or just the tail of the list)
            const idsToRemove = domain.githubProjects.slice(200).map(p => p.id);

            await (prisma as any).gitHubProject.deleteMany({
                where: {
                    id: { in: idsToRemove }
                }
            });

            console.log(`  ✅ Removed ${toRemove} projects from ${domain.name}.`);
        } else if (count < 200) {
            console.warn(`  ⚠️ Domain ${domain.name} only has ${count} projects. Needs adding.`);
        } else {
            console.log(`  ✅ Domain ${domain.name} is already at 200.`);
        }
    }

    console.log('--- Re-balancing Complete ---');
}

pruneTo200()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
