import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCronSecret } from "@/lib/cron";
import { NotificationService } from "@/lib/notifications";

export async function GET(req: Request) {
  try {
    // Vérification de sécurité obligatoire à temps constant via Authorization Bearer
    if (!validateCronSecret(req)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const results = {
      closed: 0,
      nudged: 0
    };

    // 1. Clôture des binômes actifs arrivés au terme des 30 jours
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
          status: "COMPLETED",
          updatedAt: new Date()
        }
      });
      results.closed++;

      // Envoi de la notification in-app pour le bilan J30 du binôme
      await NotificationService.send({
        userId: binome.userAId,
        type: "BINOME_CHECKIN",
        title: "Bilan J30 Binôme",
        message: "Votre cycle de 30 jours en binôme est achevé. Venez dresser le bilan !",
        actionLink: "/binome",
      });
      await NotificationService.send({
        userId: binome.userBId,
        type: "BINOME_CHECKIN",
        title: "Bilan J30 Binôme",
        message: "Votre cycle de 30 jours en binôme est achevé. Venez dresser le bilan !",
        actionLink: "/binome",
      });
    }

    // 2. Détection d'inactivité (aucun checkin sur les 7 derniers jours)
    const inactiveBinomes = await prisma.binome.findMany({
      where: {
        status: "ACTIVE",
        startDate: { gt: thirtyDaysAgo },
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
      console.log(`[IRIS NUDGE] Inactivité détectée pour le binôme ${binome.id}`);
      await NotificationService.send({
        userId: binome.userAId,
        type: "BINOME_CHECKIN",
        title: "Relance Binôme Relationnel",
        message: "Aucun échange n'a été enregistré cette semaine. Prenez quelques minutes pour un check-in !",
        actionLink: "/binome",
      });
      await NotificationService.send({
        userId: binome.userBId,
        type: "BINOME_CHECKIN",
        title: "Relance Binôme Relationnel",
        message: "Aucun échange n'a été enregistré cette semaine. Prenez quelques minutes pour un check-in !",
        actionLink: "/binome",
      });
      results.nudged++;
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error("[CRON_BINOME_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
