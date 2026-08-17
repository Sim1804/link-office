import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.prescriptionItem.deleteMany()
  await prisma.relationalPrescription.deleteMany()
  await prisma.libraryItem.deleteMany()
  console.log("Prescriptions et Catalogue réinitialisés avec succès !")
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
