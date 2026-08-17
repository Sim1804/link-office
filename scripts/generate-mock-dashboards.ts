import { PrismaClient, Dimension, AssessmentStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const ORGANIZATIONS = [
  { name: "Acme Corp (B2B Test)", type: "B2B" },
  { name: "Mutuelle Solis (B2B2C Test)", type: "B2B2C" },
  { name: "Ville de Testville (Collectivité)", type: "COLLECTIVITE" }
];

const WEATHERS = ["Grand soleil", "Éclaircies", "Ciel couvert", "Orage", "Tempête"];
const PROFILES = ["L'Équilibriste", "Le Solidaire", "L'Indépendant", "Le Passionné", "Le Connecté"];

async function main() {
  console.log("🚀 Démarrage de la génération de données mock pour les Dashboards...");

  for (const orgData of ORGANIZATIONS) {
    // 1. Trouver l'organisation
    const org = await prisma.organization.findFirst({
      where: { name: orgData.name }
    });

    if (!org) {
      console.warn(`⚠️ Organisation ${orgData.name} introuvable. Ignorée.`);
      continue;
    }

    console.log(`\n🏢 Génération pour l'organisation: ${org.name} (${org.id})`);

    const USERS_TO_CREATE = 15;

    for (let i = 0; i < USERS_TO_CREATE; i++) {
      // 2. Créer un utilisateur fictif
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: "EMPLOYEE",
          organizationId: org.id,
          password: "mockpassword",
        }
      });

      // 3. Créer un Assessment soumis
      const assessment = await prisma.assessment.create({
        data: {
          userId: user.id,
          status: AssessmentStatus.SUBMITTED,
          consentInformation: true,
          consentResearch: true,
          consentParticipation: true,
          submittedAt: new Date(),
        }
      });

      // 4. Créer un DemographicProfile
      await prisma.demographicProfile.create({
        data: {
          assessmentId: assessment.id,
          gender: faker.helpers.arrayElement(["Homme", "Femme", "Non binaire"]),
          ageRange: faker.helpers.arrayElement(["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]),
          country: "France",
          department: faker.location.zipCode().substring(0, 2),
          occupation: faker.person.jobTitle(),
          organizationSize: orgData.type === "B2B" ? "Plus de 500 employés" : null,
          relationshipStatus: faker.helpers.arrayElement(["Célibataire", "En couple", "Marié(e)", "Divorcé(e)"]),
          children: faker.datatype.boolean(),
          childrenCount: faker.number.int({ min: 0, max: 4 }),
          livingSituation: faker.helpers.arrayElement(["Seul(e)", "En couple", "En colocation", "En famille"]),
        }
      });

      // 5. Créer un IqrhResult
      const globalScore = faker.number.float({ min: 30, max: 95, fractionDigits: 1 });
      const iqrhResult = await prisma.iqrhResult.create({
        data: {
          assessmentId: assessment.id,
          globalScore,
          socialScore: faker.number.float({ min: 20, max: 95, fractionDigits: 1 }),
          affectiveScore: faker.number.float({ min: 20, max: 95, fractionDigits: 1 }),
          sentimentalScore: faker.number.float({ min: 20, max: 95, fractionDigits: 1 }),
          professionalScore: faker.number.float({ min: 20, max: 95, fractionDigits: 1 }),
          selfScore: faker.number.float({ min: 20, max: 95, fractionDigits: 1 }),
          weather: faker.helpers.arrayElement(WEATHERS),
          balanceIndex: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
          priorityDimension: faker.helpers.arrayElement(Object.values(Dimension)),
          primaryProfile: faker.helpers.arrayElement(PROFILES),
          secondaryProfile: faker.helpers.arrayElement(PROFILES),
          profileSummary: faker.lorem.paragraph(),
        }
      });

      // 6. Créer un IcrResult
      await prisma.icrResult.create({
        data: {
          iqrhResultId: iqrhResult.id,
          score: faker.number.int({ min: 0, max: 100 }),
          familyComplexity: faker.number.int({ min: 0, max: 25 }),
          professionalComplexity: faker.number.int({ min: 0, max: 25 }),
          lifeTransitions: faker.number.int({ min: 0, max: 25 }),
          relationalLoad: faker.number.int({ min: 0, max: 25 }),
          protectiveResources: faker.number.int({ min: 0, max: 100 }),
          level: faker.helpers.arrayElement(["Faible", "Modéré", "Élevé", "Critique"]),
          interpretation: faker.lorem.sentence(),
          riskFactors: [faker.lorem.words(2), faker.lorem.words(2)],
          protectiveFactors: [faker.lorem.words(2), faker.lorem.words(2)],
          resources: [faker.lorem.words(2)],
          vulnerabilities: [],
          barriers: [],
          levers: [],
          dominantNeeds: [faker.lorem.words(2), faker.lorem.words(2)],
        }
      });
    }

    console.log(`✅ ${USERS_TO_CREATE} utilisateurs créés pour ${org.name}.`);
  }

  console.log("\n🎉 Génération terminée avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant la génération:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
