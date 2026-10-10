/**
 * @file seed-500.ts
 * @module validation/common/seed-500
 * @description Script idempotent semant >= 500 comptes de test répartis sur les 4 segments :
 * - B2B : 125 salariés rattachés à l'organisation B2B
 * - B2B2C : 125 adhérents rattachés à la mutuelle B2B2C
 * - B2G : 125 usagers rattachés à la collectivité B2G
 * - B2C : 125 utilisateurs grand public sans organisation
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seed500Accounts() {
  console.log("=== Semis Idempotent des >= 500 Comptes de Test (4 Segments) ===");

  const passwordHash = await bcrypt.hash("Admin1234!", 10);

  // Vérification / Récupération des organisations de référence
  const orgB2B = await prisma.organization.findFirst({ where: { type: "B2B" } });
  const orgB2B2C = await prisma.organization.findFirst({ where: { type: "B2B2C" } });
  const orgB2G = await prisma.organization.findFirst({ where: { type: "B2G" } });

  const campB2B = await prisma.campaign.findFirst({ where: { organizationId: orgB2B?.id } });
  const campB2B2C = await prisma.campaign.findFirst({ where: { organizationId: orgB2B2C?.id } });
  const campB2G = await prisma.campaign.findFirst({ where: { organizationId: orgB2G?.id } });

  const segments = [
    {
      name: "B2B",
      prefix: "b2b.user",
      role: "EMPLOYEE" as const,
      orgId: orgB2B?.id || null,
      campId: campB2B?.id || null,
      count: 125,
    },
    {
      name: "B2B2C",
      prefix: "b2b2c.user",
      role: "MEMBER" as const,
      orgId: orgB2B2C?.id || null,
      campId: campB2B2C?.id || null,
      count: 125,
    },
    {
      name: "B2G",
      prefix: "b2g.user",
      role: "CITIZEN" as const,
      orgId: orgB2G?.id || null,
      campId: campB2G?.id || null,
      count: 125,
    },
    {
      name: "B2C",
      prefix: "b2c.user",
      role: "CITIZEN" as const,
      orgId: null,
      campId: null,
      count: 125,
    },
  ];

  let totalUpserted = 0;

  for (const seg of segments) {
    const userBatch = [];
    for (let i = 1; i <= seg.count; i++) {
      const email = `${seg.prefix}.${i}@linkoffice-loadtest.fr`;
      userBatch.push({
        email,
        password: passwordHash,
        firstName: `Test${seg.name}`,
        lastName: `User${i}`,
        role: seg.role,
        organizationId: seg.orgId,
        campaignId: seg.campId,
      });
    }

    for (const u of userBatch) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          password: u.password,
          role: u.role,
          organizationId: u.organizationId,
          campaignId: u.campaignId,
        },
        create: u,
      });
      totalUpserted++;
    }

    console.log(`✓ Segment ${seg.name} semé : ${seg.count} comptes.`);
  }

  const finalUserCount = await prisma.user.count({
    where: { email: { contains: "linkoffice-loadtest.fr" } },
  });

  console.log(`✓ Total des comptes semés : ${finalUserCount} (Total traité : ${totalUpserted})`);
  return finalUserCount;
}

if (require.main === module) {
  seed500Accounts()
    .catch((err) => {
      console.error("Erreur de semis :", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
