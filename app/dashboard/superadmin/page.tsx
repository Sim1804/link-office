import { DashboardClient } from "./DashboardClient";
import { prisma } from "@/lib/prisma";
import { getSuperAdminStats } from "@/lib/adminStats";

export const dynamic = 'force-dynamic';

export default async function SuperAdminOverviewPage() {
  const baseStats = await getSuperAdminStats();
  
  const recentLeads = await prisma.lead.findMany({
    where: { status: "NEW" },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  const stats = {
    ...baseStats,
    recentLeads
  };

  return <DashboardClient stats={stats} />;
}
