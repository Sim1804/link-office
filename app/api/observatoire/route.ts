import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Revalidation toutes les 5 minutes pour éviter de surcharger la base de données
export const revalidate = 300; 

export async function GET() {
  try {
    // Agrégation globale des données IqrhResult pour le baromètre public
    const aggregations = await prisma.iqrhResult.aggregate({
      _avg: {
        globalScore: true,
        socialScore: true,
        affectiveScore: true,
        sentimentalScore: true,
        professionalScore: true,
        selfScore: true,
      },
      _count: {
        id: true,
      },
    });

    // Si aucune donnée n'existe encore
    if (aggregations._count.id === 0) {
      return NextResponse.json({
        totalAssessments: 0,
        globalScore: 0,
        dimensions: {
          social: 0,
          affective: 0,
          sentimental: 0,
          professional: 0,
          self: 0,
        },
        leadingDimension: "N/A",
      });
    }

    // Déterminer la dimension "phare" du moment
    const scores = {
      "Relations sociales": aggregations._avg.socialScore || 0,
      "Relations affectives": aggregations._avg.affectiveScore || 0,
      "Vie sentimentale": aggregations._avg.sentimentalScore || 0,
      "Vie professionnelle": aggregations._avg.professionalScore || 0,
      "Relation à soi": aggregations._avg.selfScore || 0,
    };

    const leadingDimension = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    // Récupérer les détails (ICR, Météo)
    const results = await prisma.iqrhResult.findMany({
      select: {
        weather: true,
        weatherTitle: true,
        icr: {
          select: {
            score: true,
            riskFactors: true,
            protectiveFactors: true,
            dominantNeeds: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5000 // Limite pour la performance sur un observatoire public
    });

    // Distribution des météos
    const weatherDistribution = results.reduce(
      (acc, result) => {
        const weatherKey = result.weatherTitle || result.weather;
        if (weatherKey) {
          acc[weatherKey] = (acc[weatherKey] ?? 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Analyse de l'ICR (Besoins Dominants & Facteurs de Risques)
    const icrResultsOnly = results.map(r => r.icr).filter(Boolean);
    const dominantNeedCounts = new Map<string, number>();
    const riskFactorCounts = new Map<string, number>();

    for (const icrResult of icrResultsOnly) {
      if (!icrResult) continue;
      for (const need of icrResult.dominantNeeds) {
        dominantNeedCounts.set(need, (dominantNeedCounts.get(need) ?? 0) + 1);
      }
      for (const risk of icrResult.riskFactors) {
        riskFactorCounts.set(risk, (riskFactorCounts.get(risk) ?? 0) + 1);
      }
    }

    const topDominantNeeds = [...dominantNeedCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count, pct: Math.round((count / results.length) * 100) }));

    const topRiskFactors = [...riskFactorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count, pct: Math.round((count / results.length) * 100) }));

    return NextResponse.json({
      totalAssessments: aggregations._count.id,
      globalScore: Math.round(aggregations._avg.globalScore || 0),
      dimensions: {
        social: Math.round(aggregations._avg.socialScore || 0),
        affective: Math.round(aggregations._avg.affectiveScore || 0),
        sentimental: Math.round(aggregations._avg.sentimentalScore || 0),
        professional: Math.round(aggregations._avg.professionalScore || 0),
        self: Math.round(aggregations._avg.selfScore || 0),
      },
      leadingDimension,
      weatherDistribution,
      topDominantNeeds,
      topRiskFactors,
    });
  } catch (error) {
    console.error("[OBSERVATOIRE_API_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données de l'observatoire." },
      { status: 500 }
    );
  }
}
