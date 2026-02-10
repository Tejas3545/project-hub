import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const id = 'admin-user';
  const email = 'admin@project.com';
  const password = 'Admin@123';

  const passwordHash = bcrypt.hashSync(password, 10);

  const user = await prisma.user.upsert({
    where: { id },
    update: {
      email,
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
    },
    create: {
      id,
      email,
      passwordHash,
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
