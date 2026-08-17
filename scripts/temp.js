const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.libraryItem.findMany();
  for (let item of items) {
    if (JSON.stringify(item).includes('proposeSeveral')) {
      console.log('Found in item:', item.id, item.title);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
