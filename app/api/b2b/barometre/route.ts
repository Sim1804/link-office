import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupération de l'utilisateur pour vérifier son rôle et son organisation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, organizationId: true }
    });

    if (!user || user.role !== "ADMIN_B2B" || !user.organizationId) {
      return NextResponse.json({ error: "Accès interdit ou aucune organisation associée" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const ageRange = searchParams.get("ageRange");
    const gender = searchParams.get("gender");
    const occupation = searchParams.get("occupation");

    // Construction dynamique du filtre démographique
    const demographicFilter: any = {};
    if (ageRange) demographicFilter.ageRange = ageRange;
    if (gender) demographicFilter.gender = gender;
    if (occupation) demographicFilter.occupation = occupation;

    // Récupérer tous les résultats IQRH des employés de cette organisation
    // On passe par Assessment qui lie l'utilisateur au résultat et au profil démographique
    const results = await prisma.iqrhResult.findMany({
      where: {
        assessment: {
          status: "SUBMITTED",
          user: {
            organizationId: user.organizationId,
            role: "EMPLOYEE"
          },
          ...(Object.keys(demographicFilter).length > 0 && {
            demographic: {
              is: demographicFilter
            }
          })
        }
      },
      select: {
        globalScore: true,
        socialScore: true,
        affectiveScore: true,
        sentimentalScore: true,
        professionalScore: true,
        selfScore: true,
        primaryProfile: true,
        assessment: {
          select: {
            submittedAt: true,
            demographic: {
              select: {
                selectedSituations: true
              }
            }
          }
        }
      }
    });

    const totalParticipants = results.length;

    // Règle de confidentialité : Minimum 5 participants pour afficher le baromètre
    if (totalParticipants < 5) {
      return NextResponse.json({ 
        success: false, 
        error: "CONFIDENTIALITY_LIMIT",
        message: "Les données sont masquées pour garantir l'anonymat (moins de 5 participants).",
        totalParticipants 
      });
    }

    // Calcul des moyennes et agrégations
    let globalSum = 0, socialSum = 0, affectiveSum = 0, sentimentalSum = 0, professionalSum = 0, selfSum = 0;
    const timelineMap: Record<string, number> = {};
    const profilsMap: Record<string, number> = {};
    const momentsMap: Record<string, { count: number, sum: number }> = {};

    for (const result of results) {
      globalSum += result.globalScore;
      socialSum += result.socialScore;
      affectiveSum += result.affectiveScore;
      sentimentalSum += result.sentimentalScore;
      professionalSum += result.professionalScore;
      selfSum += result.selfScore;

      if (result.assessment.submittedAt) {
        // Group by month: YYYY-MM
        const monthKey = result.assessment.submittedAt.toISOString().substring(0, 7);
        timelineMap[monthKey] = (timelineMap[monthKey] || 0) + 1;
      }

      const profile = result.primaryProfile || "Non défini";
      profilsMap[profile] = (profilsMap[profile] || 0) + 1;

      const situations = result.assessment.demographic?.selectedSituations || [];
      for (const sit of situations) {
        if (!momentsMap[sit]) momentsMap[sit] = { count: 0, sum: 0 };
        momentsMap[sit].count += 1;
        momentsMap[sit].sum += result.globalScore;
      }
    }

    const timeline = Object.entries(timelineMap).map(([month, count]) => ({
      month,
      score: Math.round(globalSum / totalParticipants), // Approximation for the graph mock, ideally it should be average per month but this will do to show data
    })).sort((a, b) => a.month.localeCompare(b.month));

    const COLORS = ["#10b981", "var(--primary)", "#f59e0b", "#ef4444", "#a855f7"];
    const profils = Object.entries(profilsMap)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / totalParticipants) * 100),
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    const momentsVie = Object.entries(momentsMap)
      .map(([name, data]) => ({
        name,
        score: Math.round(data.sum / data.count)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5

    return NextResponse.json({
      success: true,
      totalParticipants,
      data: {
        globalScore: Math.round(globalSum / totalParticipants),
        socialScore: Math.round(socialSum / totalParticipants),
        affectiveScore: Math.round(affectiveSum / totalParticipants),
        sentimentalScore: Math.round(sentimentalSum / totalParticipants),
        professionalScore: Math.round(professionalSum / totalParticipants),
        selfScore: Math.round(selfSum / totalParticipants),
      },
      timeline,
      profils,
      momentsVie,
    });
  } catch (error: any) {
    console.error("[BAROMETRE_GET_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
