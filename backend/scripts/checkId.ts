import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const p = await (prisma as any).gitHubProject.findUnique({ where: { id: '2faf03c3-9044-4b73-b985-9737921c803a' } });
    console.log(p ? 'Found: ' + p.title : 'Not Found');
}
main().finally(() => (prisma as any).$disconnect());
