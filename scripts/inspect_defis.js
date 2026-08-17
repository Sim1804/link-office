/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const item = await prisma.libraryItem.findFirst({ where: { library: 'Micro-défis' } });
  console.log(JSON.stringify(item, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());

