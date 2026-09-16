import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getSuperAdminStats = cache(async () => {
  const [
    orgsTotal, orgsB2B, orgsB2B2C, orgsB2G,
    leadsUrgent, leadsTotal,
    usersTotal, mediaTotal
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { type: "B2B" } }),
    prisma.organization.count({ where: { type: "B2B2C" } }),
    prisma.organization.count({ where: { type: "B2G" } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count(),
    prisma.user.count(),
    prisma.mediaContent.count()
  ]);

  return {
    orgsTotal, orgsB2B, orgsB2B2C, orgsB2G,
    leadsUrgent, leadsTotal,
    usersTotal, mediaTotal
  };
});
