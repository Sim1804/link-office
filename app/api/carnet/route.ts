import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les 30 derniers jours de check-ins météo
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const meteos = await prisma.meteoCheckin.findMany({
      where: {
        userId: session.user.id,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: "desc" }
    });

    // Récupérer le plan actif
    const plan = await prisma.relationalPlan.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: {
        priorities: {
          include: { actions: true }
        }
      }
    });

    // Récupérer les événements de vie récents
    const lifeEvents = await prisma.lifeEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 5
    });

    return NextResponse.json({ success: true, meteos, plan, lifeEvents });
  } catch (error: any) {
    console.error("[CARNET_GET_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
