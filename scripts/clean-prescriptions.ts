import { prisma } from "../lib/prisma";
async function run() {
  await prisma.relationalPrescription.deleteMany();
  console.log("Deleted all prescriptions");
}
run().finally(() => prisma.$disconnect());
