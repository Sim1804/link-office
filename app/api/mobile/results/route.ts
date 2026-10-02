import { NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { ResultService } from "@/lib/iqrh/result-service";

const dimensions = [
  ["SOCIAL", "Relations sociales"],
  ["AFFECTIVE", "Relations affectives"],
  ["SENTIMENTAL", "Vie sentimentale"],
  ["PROFESSIONAL", "Vie professionnelle"],
  ["SELF", "Relation à soi"],
] as const;

const scoreFor = (score: number) =>
  score < 40 ? "Cette dimension mérite une attention particulière." :
  score < 60 ? "Une dimension à consolider progressivement." :
  score < 80 ? "Un équilibre globalement satisfaisant." :
  "Une ressource solide sur laquelle vous appuyer.";

/** Returns only the authenticated person's latest calculated IQRH report. */
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const result = await ResultService.byUser(user.id);
    if (!result) return NextResponse.json({ error: "Aucun résultat n'est encore disponible." }, { status: 404 });

    const scores: Record<(typeof dimensions)[number][0], number> = {
      SOCIAL: result.socialScore,
      AFFECTIVE: result.affectiveScore,
      SENTIMENTAL: result.sentimentalScore,
      PROFESSIONAL: result.professionalScore,
      SELF: result.selfScore,
    };
    return NextResponse.json({
      completedAt: result.assessment.submittedAt ?? result.createdAt,
      globalScore: Math.round(result.globalScore),
      weather: result.weatherTitle || result.weather,
      summary: result.weatherText || "Votre bilan a été calculé à partir de vos réponses.",
      priorityDimension: dimensions.find(([code]) => code === result.priorityDimension)?.[1] ?? "Votre priorité relationnelle",
      dimensions: dimensions.map(([code, label]) => ({
        label,
        score: Math.round(scores[code]),
        interpretation: scoreFor(scores[code]),
      })),
      strengths: result.strengths,
      watchpoints: result.watchpoints,
      profile: result.profile ? { name: result.profile.primaryName, summary: result.profile.signature } : null,
    });
  } catch (error) {
    console.error("MOBILE RESULTS ERROR:", error);
    return NextResponse.json({ error: "Impossible de charger vos résultats." }, { status: 500 });
  }
}
