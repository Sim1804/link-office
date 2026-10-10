/**
 * @file prepare-drafts.ts
 * @module validation/t2-load/prepare-drafts
 * @description Prépare des évaluations en statut DRAFT (avec consentements, profil
 * démographique et 30 réponses dimensionnelles) pour chaque utilisateur du test de charge k6.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function prepareDraftAssessments(countPerUser = 10, userLimit = 20) {
  console.log(`Préparation des brouillons d'évaluations pour le test de charge (${userLimit} utilisateurs, ${countPerUser} brouillons chacun)...`);

  const users = await prisma.user.findMany({
    where: { email: { contains: "b2b.user" } },
    take: userLimit,
  });

  const questions = await prisma.question.findMany({
    where: { isActive: true },
    take: 30,
  });

  if (questions.length < 30) {
    throw new Error(`Nombre de questions actives insuffisant : ${questions.length} / 30`);
  }

  const draftsMap: Record<string, string[]> = {};

  for (const u of users) {
    draftsMap[u.id] = [];
    for (let i = 0; i < countPerUser; i++) {
      const draft = await prisma.assessment.create({
        data: {
          userId: u.id,
          status: "DRAFT",
          consentInformation: true,
          consentResearch: true,
          consentParticipation: true,
          demographic: {
            create: {
              gender: "F",
              ageRange: "25-34",
              country: "France",
              occupation: "Salarié",
              relationshipStatus: "En couple",
              children: false,
              livingSituation: "Appartement",
              selectedSituations: [],
            },
          },
          answers: {
            create: questions.map((q, idx) => ({
              questionId: q.id,
              value: ((idx + i) % 5) + 1,
            })),
          },
        },
      });
      draftsMap[u.id].push(draft.id);
    }
  }

  console.log(`✓ Brouillons préparés : ${users.length * countPerUser} évaluations prêtes.`);
  return draftsMap;
}

if (require.main === module) {
  prepareDraftAssessments()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
