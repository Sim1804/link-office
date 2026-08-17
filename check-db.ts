import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const recs = await prisma.libraryItem.findMany({ where: { library: 'Recommandations' }, take: 5, select: { id: true, title: true } });
  console.log("RECS:", recs);
  
  const defis = await prisma.libraryItem.findMany({ where: { library: 'Micro-défis' }, take: 5, select: { id: true, title: true } });
  console.log("DEFIS:", defis);
}

main().catch(console.error).finally(() => prisma.$disconnect());
