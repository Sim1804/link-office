import { prisma } from "../../src/lib/prisma";

async function main() {
  const userCount = await prisma.user.count();
  const assessmentCount = await prisma.assessment.count();
  const drafts = await prisma.assessment.count({ where: { status: "DRAFT" } });
  const completed = await prisma.assessment.count({ where: { status: "SUBMITTED" } });
  const libraryCount = await prisma.libraryItem.count();
  const prescriptionCount = await prisma.relationalPrescription.count();
  const iqrhCount = await prisma.iqrhResult.count();
  console.log("DB Stats:", { userCount, assessmentCount, drafts, completed, libraryCount, prescriptionCount, iqrhCount });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
