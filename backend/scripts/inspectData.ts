import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const projects = await (prisma as any).gitHubProject.findMany({
        take: 5,
        select: {
            id: true,
            title: true,
            introduction: true,
            techStack: true,
            qaStatus: true
        }
    });
    console.log(JSON.stringify(projects, null, 2));
}
main().finally(() => prisma.$disconnect());
