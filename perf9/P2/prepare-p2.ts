import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';

async function main() {
  console.log('=== Préparation des comptes et sessions pour le test de charge P2 (200 VU) ===');

  // 1. Récupérer jusqu'à 200 utilisateurs de test existants
  let users = await prisma.user.findMany({
    where: {
      email: { contains: '@' },
    },
    take: 200,
    select: { id: true, email: true },
  });

  console.log(`Trouvé ${users.length} comptes utilisateurs.`);

  // 2. Si moins de 200, créer des comptes de test dédiés
  if (users.length < 200) {
    const toCreate = 200 - users.length;
    console.log(`Création de ${toCreate} comptes utilisateurs de charge supplémentaires...`);
    const newUsers = [];
    for (let i = users.length + 1; i <= 200; i++) {
      newUsers.push({
        email: `load.p2.user.${i}@linkoffice-perf.fr`,
        firstName: "User",
        lastName: `P2 Load ${i}`,
        role: 'EMPLOYEE' as const,
        subscription: 'PREMIUM' as const,
      });
    }
    await prisma.user.createMany({ data: newUsers, skipDuplicates: true });
    users = await prisma.user.findMany({
      where: { email: { contains: '@' } },
      take: 200,
      select: { id: true, email: true },
    });
  }

  // 3. Préparer un pool de 600 brouillons prêts à être soumis (3 par VU)
  console.log('Génération de 600 évaluations DRAFT avec consentements et réponses...');
  const questions = await prisma.question.findMany({ where: { isActive: true }, take: 30 });
  const draftsPool: Record<string, string[]> = {};

  for (let idx = 0; idx < users.length; idx++) {
    const u = users[idx];
    draftsPool[u.id] = [];
    for (let d = 0; d < 3; d++) {
      const draft = await prisma.assessment.create({
        data: {
          userId: u.id,
          status: 'DRAFT',
          consentInformation: true,
          consentResearch: true,
          consentParticipation: true,
          demographic: {
            create: {
              gender: 'F',
              ageRange: '25-34',
              country: 'France',
              occupation: 'Salarié',
              relationshipStatus: 'En couple',
              children: false,
              livingSituation: 'Appartement',
              selectedSituations: [],
            },
          },
          answers: {
            create: questions.map((q, qIdx) => ({
              questionId: q.id,
              value: ((qIdx + d) % 5) + 1,
            })),
          },
        },
        select: { id: true },
      });
      draftsPool[u.id].push(draft.id);
    }
    if ((idx + 1) % 50 === 0) {
      console.log(`Brouillons créés pour ${idx + 1}/${users.length} utilisateurs.`);
    }
  }

  // 4. Générer ou obtenir les cookies de session pour les utilisateurs
  console.log('Création du fichier de métadonnées pour k6...');
  const p2Dir = path.join(process.cwd(), 'perf9', 'P2');
  if (!fs.existsSync(p2Dir)) fs.mkdirSync(p2Dir, { recursive: true });

  const accountsData = {
    timestamp: new Date().toISOString(),
    usersCount: users.length,
    users: users.map(u => ({ id: u.id, email: u.email })),
    draftsPool,
  };

  fs.writeFileSync(path.join(p2Dir, 'accounts.json'), JSON.stringify(accountsData, null, 2), 'utf8');
  console.log('✓ Données de charge sauvegardées dans perf9/P2/accounts.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
