/**
 * app/api/b2b2c/stats/route.ts — Données pour le dashboard ADMIN_B2B2C
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN_B2B2C") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true, organization: true },
  });

  if (!user?.organizationId) {
    return NextResponse.json({ error: "Aucune organisation liée." }, { status: 400 });
  }

  // Tous les utilisateurs rattachés à cette mutuelle qui ont fait au moins un assessment
  const membersWithResults = await prisma.user.findMany({
    where: {
      organizationId: user.organizationId,
      role: { in: ["MEMBER", "EMPLOYEE"] }, // Les assurés
    },
    include: {
      assessments: {
        where: { status: "SUBMITTED" },
        orderBy: { submittedAt: "desc" },
        take: 1,
        include: { result: { include: { icr: true } }, demographic: true },
      },
    },
  });

  // Filtrer ceux qui ont vraiment un résultat
  const respondents = membersWithResults.filter((u) => u.assessments.length > 0 && u.assessments[0].result);
  const respondentCount = respondents.length;
  
  const threshold = 5;

  if (respondentCount < threshold) {
    return NextResponse.json({
      anonymityBlocked: true,
      threshold,
      respondentCount,
      message: "Anonymat garanti. Vous devez avoir au moins 5 adhérents ayant terminé le questionnaire pour accéder aux données agrégées.",
    });
  }

  let totalGlobal = 0, totalSocial = 0, totalAffective = 0, totalProfessional = 0, totalSelf = 0, totalSentimental = 0;
  const icrDistribution = { faible: 0, modere: 0, eleve: 0, critique: 0 };
  const weatherDistribution: Record<string, number> = {};
  
  // Compteurs pour entonnoir de prévention (simulés/extrapolés ici pour la démo,
  // en vrai ça devrait venir des clics sur "En savoir plus")
  const orientationsCount = {
    psychological: 0, // ex: Téléconsultation psy
    social: 0,        // ex: Réseau d'entraide
    professional: 0,  // ex: Soutien RPS
  };

  for (const respondent of respondents) {
    const result = respondent.assessments[0].result!;
    
    totalGlobal += result.globalScore;
    totalSocial += result.socialScore;
    totalAffective += result.affectiveScore;
    totalProfessional += result.professionalScore;
    totalSelf += result.selfScore;
    totalSentimental += result.sentimentalScore;

    const weatherKey = result.weatherTitle || result.weather;
    if (weatherKey) {
      weatherDistribution[weatherKey] = (weatherDistribution[weatherKey] || 0) + 1;
    }

    if (result.icr) {
      const s = result.icr.score;
      if (s < 25) icrDistribution.faible++;
      else if (s < 50) icrDistribution.modere++;
      else if (s < 75) icrDistribution.eleve++;
      else icrDistribution.critique++;
    }

    // Orientations simulées (besoins détectés)
    if (result.selfScore < 40) orientationsCount.psychological++;
    if (result.socialScore < 40) orientationsCount.social++;
    if (result.professionalScore < 40) orientationsCount.professional++;
  }

  return NextResponse.json({
    anonymityBlocked: false,
    respondentCount,
    threshold,
    averages: {
      global: Math.round(totalGlobal / respondentCount),
      social: Math.round(totalSocial / respondentCount),
      affective: Math.round(totalAffective / respondentCount),
      sentimental: Math.round(totalSentimental / respondentCount),
      professional: Math.round(totalProfessional / respondentCount),
      self: Math.round(totalSelf / respondentCount),
    },
    icrDistribution,
    weatherDistribution,
    orientationsCount,
  });
}
