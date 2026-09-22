import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cronSecret = url.searchParams.get("secret");
    
    // Vérification de sécurité obligatoire
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const results = {
      closed: 0,
      nudged: 0
    };

    // 1. Fetch active binômes older than 30 days
    const expiredBinomes = await prisma.binome.findMany({
      where: {
        status: "ACTIVE",
        startDate: { lte: thirtyDaysAgo }
      }
    });

    for (const binome of expiredBinomes) {
      await prisma.binome.update({
        where: { id: binome.id },
        data: {
          status: "EVALUATION",
          updatedAt: new Date()
        }
      });
      results.closed++;
      // TODO: Send notification email for J30 Bilan
    }

    // 2. Detect inactivity (No checkins in the last 7 days)
    const inactiveBinomes = await prisma.binome.findMany({
      where: {
        status: "ACTIVE",
        startDate: { gt: thirtyDaysAgo }, // not expired yet
        checkins: {
          none: {
            date: { gte: sevenDaysAgo }
          }
        }
      },
      include: {
        userA: { select: { email: true, firstName: true } },
        userB: { select: { email: true, firstName: true } }
      }
    });

    for (const binome of inactiveBinomes) {
      // Logic for IRIS nudge. For now, simulate it.
      console.log(`[IRIS NUDGE] Inactivité détectée pour le binôme ${binome.id}`);
      results.nudged++;
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error("[CRON_BINOME_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
