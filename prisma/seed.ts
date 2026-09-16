import { PrismaClient, Dimension, QuestionKind } from "@prisma/client";
import library from "./link-office-library.json" assert { type: "json" };
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type LibraryRow = Record<string, string | number | boolean | null>;

const libraryMappings: ReadonlyArray<{ sheet: keyof typeof library; id: string; title: string; category?: string }> = [
  { sheet: "Tags", id: "tag_value", title: "tag_value", category: "tag_type" },
  { sheet: "Besoins", id: "besoin_id", title: "besoin", category: "dimensions_iqrh" },
  { sheet: "Facteurs", id: "factor_id", title: "facteur", category: "type" },
  { sheet: "Recommandations", id: "recommendation_id", title: "titre", category: "categorie" },
  { sheet: "Micro-défis", id: "micro_defi_id", title: "titre", category: "categorie" },
  { sheet: "Partenaires", id: "partenaire_id", title: "nom", category: "categorie" },
  { sheet: "Ressources", id: "ressource_id", title: "titre", category: "categorie" },
  { sheet: "Programmes LO", id: "programme_id", title: "nom_programme", category: "niveau" },
];

async function seedLibrary() {
  const items = libraryMappings.flatMap(({ sheet, id, title, category }) => (library[sheet] as LibraryRow[]).map((row, index) => ({
    id: (sheet === "Tags" || !row[id]) ? `${sheet}_${index}` : String(row[id]),
    library: sheet,
    title: String(row[title]),
    category: category ? String(row[category] ?? "") : null,
    data: row,
  })));
  await prisma.libraryItem.deleteMany();
  await prisma.libraryItem.createMany({ data: items });
}

async function seedOrganizations() {
  console.log("🏢 Seeding organisations de test...");

  const acme = await prisma.organization.upsert({
    where: { codeAccess: "ACME-2026-TEST" },
    create: { 
      name: "Acme Corp (B2B Test)", type: "B2B", codeAccess: "ACME-2026-TEST", siren: "123456789",
      contactName: "Jean Dupont", contactEmail: "jean.dupont@acme.com", contactPhone: "0102030405",
      contractType: "SaaS Annuel", territory: "France", targetPopulation: 100, quota: 100,
      startDate: new Date(), endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    },
    update: {},
  });

  const mutu = await prisma.organization.upsert({
    where: { codeAccess: "MUTU-2026-TEST" },
    create: { 
      name: "Mutuelle Solis (B2B2C Test)", type: "B2B2C", codeAccess: "MUTU-2026-TEST", siren: "987654321",
      contactName: "Marie Durant", contactEmail: "marie.durant@solis.com", contactPhone: "0607080910",
      contractType: "Partenariat Premium", territory: "National", targetPopulation: 5000, quota: 5000,
      startDate: new Date(), endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    },
    update: {},
  });

  const ville = await prisma.organization.upsert({
    where: { codeAccess: "VILLE-2026-TEST" },
    create: { 
      name: "Ville de Testville (Collectivité)", type: "B2G", codeAccess: "VILLE-2026-TEST",
      contactName: "Marc Maire", contactEmail: "contact@testville.fr", contactPhone: "0101010101",
      contractType: "Déploiement Territorial", territory: "Testville", targetPopulation: 50000, quota: 10000,
      startDate: new Date(), endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    },
    update: {},
  });

  // Mot de passe pour TOUS les comptes de test : "Admin1234!"
  const adminPasswordHash = bcrypt.hashSync("Admin1234!", 10);

  // ── Campagnes de test ───────────────────────────────────────
  const d = new Date();
  const nextMonth = new Date(d);
  nextMonth.setMonth(d.getMonth() + 1);

  const campaignAcme = await prisma.campaign.upsert({
    where: { id: "camp-acme-2026" },
    create: {
      id: "camp-acme-2026",
      organizationId: acme.id,
      title: "Campagne QVT Acme 2026",
      status: "ACTIVE",
      offer: "PREMIUM",
      startDate: d,
      endDate: nextMonth,
      targetPopulation: 100,
    },
    update: {}
  });

  const campaignMutu = await prisma.campaign.upsert({
    where: { id: "camp-mutu-2026" },
    create: {
      id: "camp-mutu-2026",
      organizationId: mutu.id,
      title: "Campagne Nationale Mutuelle Solis 2026",
      status: "ACTIVE",
      offer: "PREMIUM_PLUS",
      startDate: d,
      endDate: nextMonth,
      targetPopulation: 5000,
    },
    update: {}
  });

  const campaignVille = await prisma.campaign.upsert({
    where: { id: "camp-ville-2026" },
    create: {
      id: "camp-ville-2026",
      organizationId: ville.id,
      title: "Observatoire Territorial Testville 2026",
      status: "ACTIVE",
      offer: "PREMIUM",
      startDate: d,
      endDate: nextMonth,
      targetPopulation: 50000,
    },
    update: {}
  });

  // ── Mock Assessments for Dashboards ──────────────────────────────
  console.log("📊 Seeding mock assessments for dashboards...");
  const campaigns = [campaignAcme, campaignMutu, campaignVille];
  let mockUserCount = 0;
  
  for (const campaign of campaigns) {
    for (let i = 0; i < 12; i++) {
      mockUserCount++;
      const user = await prisma.user.create({
        data: {
          email: `mock.user.${campaign.id}.${mockUserCount}@linkoffice.fr`,
          firstName: "Mock", lastName: `User ${mockUserCount}`,
          password: adminPasswordHash,
          role: "EMPLOYEE",
          organizationId: campaign.organizationId,
          campaignId: campaign.id,
          has_completed_demographics: true,
        }
      });

      const startedAt = new Date(d.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000);
      const submittedAt = new Date(startedAt.getTime() + 10 * 60 * 1000);

      const assessment = await prisma.assessment.create({
        data: {
          userId: user.id,
          campaignId: campaign.id,
          status: "COMPLETED",
          consentInformation: true,
          consentResearch: true,
          startedAt,
          submittedAt,
        }
      });

      await prisma.demographicProfile.create({
        data: {
          assessmentId: assessment.id,
          gender: ["Homme", "Femme", "Autre"][Math.floor(Math.random() * 3)],
          ageRange: ["18-25", "26-35", "36-45", "46-55", "56+"][Math.floor(Math.random() * 5)],
          country: "France",
          occupation: "Employé",
          relationshipStatus: ["Célibataire", "En couple", "Marié(e)"][Math.floor(Math.random() * 3)],
          children: Math.random() > 0.5,
          livingSituation: "Logement indépendant",
          selectedSituations: ["Parent"],
        }
      });

      const globalScore = 40 + Math.random() * 50;
      await prisma.iqrhResult.create({
        data: {
          assessmentId: assessment.id,
          globalScore,
          socialScore: 40 + Math.random() * 50,
          affectiveScore: 40 + Math.random() * 50,
          sentimentalScore: 40 + Math.random() * 50,
          professionalScore: 40 + Math.random() * 50,
          selfScore: 40 + Math.random() * 50,
          weather: globalScore > 75 ? "TRES_BIEN" : globalScore > 55 ? "PLUTOT_BIEN" : "FRAGILE",
          balanceIndex: Math.random() * 15,
          priorityDimension: ["SOCIAL", "AFFECTIVE", "SENTIMENTAL", "PROFESSIONAL", "SELF"][Math.floor(Math.random() * 5)] as Dimension,
          primaryProfile: "Connecté", secondaryProfile: "Solidaire",
          profileSummary: "Profil simulé pour les statistiques.",
          createdAt: submittedAt,
        }
      });
    }
  }

  // ── Comptes admins de test ───────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin.b2b@linkoffice.fr" },
    create: {
      email: "admin.b2b@linkoffice.fr",
      firstName: "RH", lastName: "Admin B2B",
      password: adminPasswordHash,
      role: "ADMIN_B2B",
      organizationId: acme.id,
    },
    update: { password: adminPasswordHash, role: "ADMIN_B2B", organizationId: acme.id },
  });

  await prisma.user.upsert({
    where: { email: "admin.b2b2c@linkoffice.fr" },
    create: {
      email: "admin.b2b2c@linkoffice.fr",
      firstName: "Gestionnaire", lastName: "Mutuelle",
      password: adminPasswordHash,
      role: "ADMIN_B2B2C",
      organizationId: mutu.id,
    },
    update: { password: adminPasswordHash, role: "ADMIN_B2B2C", organizationId: mutu.id },
  });

  await prisma.user.upsert({
    where: { email: "admin.collectivite@linkoffice.fr" },
    create: {
      email: "admin.collectivite@linkoffice.fr",
      firstName: "Direction", lastName: "Ville",
      password: adminPasswordHash,
      role: "ADMIN_COLLECTIVITE",
      organizationId: ville.id,
    },
    update: { password: adminPasswordHash, role: "ADMIN_COLLECTIVITE", organizationId: ville.id },
  });

  await prisma.user.upsert({
    where: { email: "superadmin@linkoffice.fr" },
    create: {
      email: "superadmin@linkoffice.fr",
      firstName: "Super", lastName: "Admin",
      password: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
    update: { password: adminPasswordHash, role: "SUPER_ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: "demo@linkoffice.fr" },
    create: {
      id: "demo-user",
      email: "demo@linkoffice.fr",
      firstName: "Camille",
      lastName: "Demo",
      password: adminPasswordHash,
      role: "EMPLOYEE",
      subscription: "FREEMIUM",
    },
    update: { password: adminPasswordHash, role: "EMPLOYEE", subscription: "FREEMIUM" },
  });

  await prisma.user.upsert({
    where: { email: "demo.b2b2c@linkoffice.fr" },
    create: {
      id: "demo-user-b2b2c",
      email: "demo.b2b2c@linkoffice.fr",
      firstName: "Sacha",
      lastName: "Bénéficiaire",
      password: adminPasswordHash,
      role: "EMPLOYEE",
      subscription: "PREMIUM_PLUS",
      campaignId: campaignMutu.id,
    },
    update: { password: adminPasswordHash, role: "EMPLOYEE", subscription: "PREMIUM_PLUS", campaignId: campaignMutu.id },
  });

  console.log("✅ Organisations, campagnes et utilisateurs de test créés avec succès !");
  console.log(`  B2B Admin     : admin.b2b@linkoffice.fr | Admin1234!`);
  console.log(`  B2B2C Admin   : admin.b2b2c@linkoffice.fr | Admin1234!`);
  console.log(`  Collectivité  : admin.collectivite@linkoffice.fr | Admin1234!`);
  console.log(`  Super Admin   : superadmin@linkoffice.fr | Admin1234!`);
  console.log(`  Demo Freemium : demo@linkoffice.fr | Admin1234!`);
  console.log(`  Demo B2B2C (Premium+) : demo.b2b2c@linkoffice.fr | Admin1234!`);
}

async function main() {
  await prisma.prescriptionItem.deleteMany();
  await prisma.relationalPrescription.deleteMany();
  await prisma.icrResult.deleteMany();
  await prisma.profileResult.deleteMany();
  await prisma.iqrhResult.deleteMany();
  await prisma.adaptiveAnswer.deleteMany();
  await prisma.questionnaireAnswer.deleteMany();
  await prisma.demographicProfile.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.adaptiveModule.deleteMany();

  const questionsIqrh = library["Questions_IQRH"] as any[];
  const modulesAdaptatifs = library["Modules_Adaptatifs"] as any[];

  await prisma.question.createMany({
    data: questionsIqrh.map((q) => ({
      id: q.id,
      text: q.text,
      position: q.position,
      kind: QuestionKind.REFERENCE,
      dimension: q.dimension as Dimension,
      version: q.version || 1,
      isActive: true,
    })),
  });

  for (const mod of modulesAdaptatifs) {
    await prisma.adaptiveModule.create({
      data: {
        id: mod.id,
        triggerSituation: mod.triggerSituation,
        title: mod.title,
        objective: mod.objective,
        position: mod.position,
        version: mod.version || 1,
        isActive: true,
        questions: {
          create: mod.questions.map((q: any) => ({
            id: q.id,
            position: q.position,
            text: q.text,
            version: q.version || 1,
            isActive: true,
          })),
        },
      },
    });
  }

  await seedLibrary();
  await seedOrganizations();
}

main().finally(() => prisma.$disconnect());
