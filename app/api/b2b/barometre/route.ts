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

    // Calcul des moyennes
    const averages = results.reduce(
      (acc, curr) => {
        acc.global += curr.globalScore;
        acc.social += curr.socialScore;
        acc.affective += curr.affectiveScore;
        acc.sentimental += curr.sentimentalScore;
        acc.professional += curr.professionalScore;
        acc.self += curr.selfScore;
        return acc;
      },
      { global: 0, social: 0, affective: 0, sentimental: 0, professional: 0, self: 0 }
    );

    return NextResponse.json({
      success: true,
      totalParticipants,
      data: {
        globalScore: Math.round(averages.global / totalParticipants),
        socialScore: Math.round(averages.social / totalParticipants),
        affectiveScore: Math.round(averages.affective / totalParticipants),
        sentimentalScore: Math.round(averages.sentimental / totalParticipants),
        professionalScore: Math.round(averages.professional / totalParticipants),
        selfScore: Math.round(averages.self / totalParticipants),
      }
    });
  } catch (error: any) {
    console.error("[BAROMETRE_GET_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
