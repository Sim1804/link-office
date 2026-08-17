/**
 * @file route.ts
 * @module app/api/questionnaire/submit
 * @description Route API pour soumettre définitivement une évaluation IQRH.
 *
 * C'est la route la plus critique du système : elle déclenche la cascade complète
 * de calculs psychométriques après que l'utilisateur a répondu à toutes les questions.
 *
 * Pipeline déclenché par `ResultService.submit()` :
 * 1. Calcul des scores IQRH (IQRHCalculationService) — 5 dimensions + score global
 * 2. Calcul de l'ICR (IcrCalculationService) — Indice de Complexité Relationnelle
 * 3. Calcul de l'IER — Indice d'Équilibre Relationnel
 * 4. Détermination de la Météo Relationnelle et du Profil IQRH
 * 5. Génération de l'Ordonnance Relationnelle (recommandations + défis)
 * 6. Initialisation de la gamification (points, badges)
 * 7. Changement de statut de l'évaluation : DRAFT → SUBMITTED
 *
 * Sécurités :
 * - L'utilisateur doit être authentifié
 * - L'évaluation doit exister
 * - L'utilisateur doit être le propriétaire de l'évaluation
 *
 * @method POST
 * @body {{ assessmentId: string }} — Validé par `submitSchema`
 * @returns {IqrhResult} — Le résultat complet avec tous les scores et l'ordonnance
 * @throws {401} Si l'utilisateur n'est pas connecté
 * @throws {404} Si l'évaluation est introuvable
 * @throws {403} Si l'utilisateur n'est pas le propriétaire
 * @throws {400} Si les données sont invalides ou si la soumission échoue
 *
 * @see lib/iqrh/result-service.ts — Orchestrateur des calculs IQRH
 * @see app/questionnaire/page.tsx — Page qui appelle cette route
 */
import { NextResponse } from "next/server";
import { ResultService } from "@/lib/iqrh/result-service";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Schéma de validation des données entrantes pour la soumission.
 * Seul l'identifiant de l'évaluation est requis.
 */
const submitSchema = z.object({
  assessmentId: z.string().min(1),
});

/**
 * Soumet définitivement une évaluation IQRH et déclenche la génération du rapport complet.
 *
 * @param request - Requête HTTP avec le body `{ assessmentId }`
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour soumettre votre évaluation." },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    const { assessmentId } = submitSchema.parse(requestBody);

    // Vérifier l'existence de l'évaluation et récupérer son propriétaire
    const assessmentRecord = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true },
    });

    if (!assessmentRecord) {
      return NextResponse.json(
        { error: "Évaluation introuvable." },
        { status: 404 }
      );
    }

    // Sécurité: Vérifier que l'utilisateur soumet bien SON évaluation
    if (assessmentRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès refusé. Vous ne pouvez pas soumettre cette évaluation." },
        { status: 403 }
      );
    }

    // Déclenchement de la logique métier complexe (calcul des scores, profils, etc.)
    const finalResult = await ResultService.submit(assessmentId);
    return NextResponse.json(finalResult);

  } catch (error) {
    console.error("[QUESTIONNAIRE_SUBMIT_ERROR]:", error);

    // Erreur de validation Zod — données mal formées
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides.", details: error.issues },
        { status: 400 }
      );
    }

    // En développement, inclure la stack trace pour faciliter le debug
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Soumission impossible.",
        ...(process.env.NODE_ENV === "development" && error instanceof Error
          ? { stack: error.stack }
          : {}),
      },
      { status: 400 }
    );
  }
}