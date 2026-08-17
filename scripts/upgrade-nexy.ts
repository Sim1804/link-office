import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { email: { contains: 'nexy' } } });
  if (user) {
    await prisma.user.update({ where: { id: user.id }, data: { subscription: 'PREMIUM' } });
    console.log('Upgraded', user.email);
  } else {
    console.log('not found');
  }
}
main();
