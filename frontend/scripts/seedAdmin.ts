import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const id = 'admin-user';
  const email = 'admin@project.com';

  const user = await prisma.user.upsert({
    where: { id },
    update: {
      email,
      role: 'ADMIN',
      isVerified: true,
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
    },
    create: {
      id,
      email,
      role: 'ADMIN',
      isVerified: true,
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
    },
  });

  console.log('Upserted user:', user.id, user.email, user.role);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
