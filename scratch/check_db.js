const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.count();
  const assessments = await prisma.assessment.count({ where: { status: 'SUBMITTED' } });
  const results = await prisma.iqrhResult.count();
  const avg = await prisma.iqrhResult.aggregate({
    _avg: {
      globalScore: true,
      socialScore: true,
      affectiveScore: true,
      sentimentalScore: true,
      professionalScore: true,
      selfScore: true,
    }
  });

  // Check sector breakdowns if campaigns or demographics have sectors/occupations
  const demographics = await prisma.demographicProfile.findMany({
    select: { occupation: true, organizationSize: true, assessment: { select: { result: { select: { globalScore: true } } } } }
  });

  const campaigns = await prisma.campaign.findMany({
    select: { id: true, title: true, organization: { select: { name: true, type: true } }, _count: { select: { assessments: true } } }
  });

  console.log(JSON.stringify({ orgs, assessments, results, avg, demographicsCount: demographics.length, campaigns }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
