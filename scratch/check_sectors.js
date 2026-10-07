const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assessments = await prisma.assessment.findMany({
    where: { status: 'SUBMITTED', result: { isNot: null } },
    include: {
      result: true,
      demographic: true,
      campaign: { include: { organization: true } },
      user: { include: { organization: true } }
    }
  });

  const sectors = {};
  for (const a of assessments) {
    const org = a.campaign?.organization || a.user?.organization;
    const type = org?.type || 'B2C';
    const sectorName = type === 'B2B2C' ? 'sante' : type === 'B2G' ? 'public' : type === 'B2B' ? 'entreprise' : 'particulier';
    if (!sectors[sectorName]) {
      sectors[sectorName] = { count: 0, sum: 0 };
    }
    sectors[sectorName].count++;
    sectors[sectorName].sum += a.result.globalScore;
  }

  for (const k in sectors) {
    sectors[k].avg = Number((sectors[k].sum / sectors[k].count).toFixed(1));
  }

  console.log('Sectors breakdown:', JSON.stringify(sectors, null, 2));
}

main().finally(() => prisma.$disconnect());
