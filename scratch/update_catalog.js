const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const fileData = fs.readFileSync('./prisma/link-office-library.json', 'utf8');
  const library = JSON.parse(fileData);

  console.log("Updating IQRH questions...");
  if (library["Questions_IQRH"]) {
    const questionsIqrh = library["Questions_IQRH"];
    await prisma.questionnaireAnswer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.question.createMany({
      data: questionsIqrh.map((q) => ({
        id: q.id,
        text: q.text,
        position: q.position,
        kind: "REFERENCE",
        dimension: q.dimension,
        version: q.version || 1,
        isActive: q.isActive !== false,
      })),
    });
  }

  console.log("Updating Adaptive Modules...");
  if (library["Modules_Adaptatifs"]) {
    const modulesAdaptatifs = library["Modules_Adaptatifs"];
    await prisma.adaptiveAnswer.deleteMany();
    await prisma.adaptiveModule.deleteMany();
    for (const mod of modulesAdaptatifs) {
      await prisma.adaptiveModule.create({
        data: {
          id: mod.id,
          triggerSituation: mod.triggerSituation,
          title: mod.title,
          objective: mod.objective,
          position: mod.position,
          version: mod.version || 1,
          isActive: mod.isActive !== false,
          questions: {
            create: mod.questions.map((q) => ({
              id: q.id,
              position: q.position,
              text: q.text,
              version: q.version || 1,
              isActive: q.isActive !== false,
            })),
          },
        },
      });
    }
  }

  console.log("Database updated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
