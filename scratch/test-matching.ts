import { PrismaClient } from '@prisma/client';
import { MatchingService } from '../src/lib/binome/matching-service';

const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ 
    where: { 
      role: 'EMPLOYEE',
      assessments: {
        some: { status: 'SUBMITTED' }
      }
    },
    include: { assessments: { where: { status: 'SUBMITTED' }, include: { result: true, campaign: true } } }
  });
  if (users.length < 2) {
    console.log("Not enough users to test matching.");
    return;
  }
  
  const user1 = users[0];
  console.log(`Testing matching for user: ${user1.email} (${user1.id})`);
  
  const campaign = user1.assessments[0].campaign;
  if (campaign) {
     await prisma.campaign.update({
        where: { id: campaign.id },
        data: { offer: "PREMIUM_PLUS" }
     });
     console.log("Upgraded campaign to PREMIUM_PLUS");
  }
  
  // Set opt-in for all so they can match
  for (const u of users) {
    await MatchingService.setOptIn(u.id, true);
  }
  
  const result = await MatchingService.findAndInvitePartner(user1.id);
  console.log("Matching Result:", result);
}

run().catch(console.error).finally(() => prisma.$disconnect());
