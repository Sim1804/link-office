const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding test accounts...");

  const password = await bcrypt.hash("Test1234!", 12);

  // 1. B2B (Entreprise)
  let orgB2B = await prisma.organization.findUnique({ where: { codeAccess: 'ACME-2026' } });
  if (!orgB2B) {
    orgB2B = await prisma.organization.create({
      data: {
        name: "Acme Corp (B2B Test)",
        type: "B2B",
        codeAccess: "ACME-2026",
      }
    });
  }

  const b2bAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: { password, organizationId: orgB2B.id },
    create: {
      email: 'admin@acme.com',
      password,
      firstName: 'Alice',
      lastName: 'RH',
      role: 'ADMIN_B2B',
      organizationId: orgB2B.id,
    }
  });

  // 2. B2B2C (Mutuelle)
  let orgB2B2C = await prisma.organization.findUnique({ where: { codeAccess: 'MUTUELLE-2026' } });
  if (!orgB2B2C) {
    orgB2B2C = await prisma.organization.create({
      data: {
        name: "Harmonie Mutuelle (B2B2C Test)",
        type: "B2B2C",
        codeAccess: "MUTUELLE-2026",
      }
    });
  }

  const b2b2cAdmin = await prisma.user.upsert({
    where: { email: 'admin@mutuelle.com' },
    update: { password, organizationId: orgB2B2C.id },
    create: {
      email: 'admin@mutuelle.com',
      password,
      firstName: 'Bernard',
      lastName: 'Assurance',
      role: 'ADMIN_B2B2C',
      organizationId: orgB2B2C.id,
    }
  });

  // 3. COLLECTIVITE (Mairie)
  let orgCol = await prisma.organization.findUnique({ where: { codeAccess: 'LYON-2026' } });
  if (!orgCol) {
    orgCol = await prisma.organization.create({
      data: {
        name: "Mairie de Lyon (Collectivité Test)",
        type: "COLLECTIVITE",
        codeAccess: "LYON-2026",
      }
    });
  }

  const colAdmin = await prisma.user.upsert({
    where: { email: 'maire@lyon.fr' },
    update: { password, organizationId: orgCol.id },
    create: {
      email: 'maire@lyon.fr',
      password,
      firstName: 'Claire',
      lastName: 'Maire',
      role: 'ADMIN_COLLECTIVITE',
      organizationId: orgCol.id,
    }
  });

  console.log("Seeding complete!");
  console.log({
    B2B: b2bAdmin.email,
    B2B2C: b2b2cAdmin.email,
    COL: colAdmin.email
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
