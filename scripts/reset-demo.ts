import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.relationalPrescription.deleteMany({ where: { user: { email: 'demo@linkoffice.fr' } } });
  console.log('Prescriptions deleted');
}
main().then(() => prisma.$disconnect());
