import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  console.log(user);
}
main().then(() => prisma.$disconnect());
