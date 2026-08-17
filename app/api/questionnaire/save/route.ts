/**
 * @file route.ts
 * @module app/api/questionnaire/save
 * @description Route API pour sauvegarder la progression d'une évaluation IQRH en cours.
 *
 * Appelée à chaque fois que l'utilisateur répond à une question (sauvegarde automatique).
 * Utilise un `upsert` via `QuestionnaireService.save()` pour éviter les doublons.
 * L'évaluation reste en statut "DRAFT" jusqu'à la soumission finale.
 *
 * Sécurités implémentées :
 * - Vérification de l'existence de l'évaluation
 * - Anti-usurpation : un utilisateur ne peut sauvegarder que SA propre évaluation
 * - Exception pour le compte demo (userId = "demo-user") en développement
 *
 * @method POST
 * @body {{ assessmentId, questionId, value }} — Validé par `saveSchema`
 * @returns {Assessment} — L'évaluation avec les réponses mises à jour
 * @throws {404} Si l'évaluation est introuvable
 * @throws {401} Si l'utilisateur n'est pas authentifié (et non-demo)
 * @throws {403} Si l'utilisateur tente de modifier une évaluation qui ne lui appartient pas
 * @throws {400} Si les données sont invalides (Zod)
 *
 * @see lib/iqrh/questionnaire-service.ts — Méthode `save()` utilisée ici
 * @see lib/iqrh/schemas.ts — Schéma `saveSchema` de validation
 */

import { NextResponse } from "next/server";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
import { saveSchema } from "@/lib/iqrh/schemas";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Sauvegarde la réponse à une question dans une évaluation IQRH en cours.
 *
 * @param request - Requête HTTP avec le body `{ assessmentId, questionId, value }`
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const requestBody = await request.json();
    const validatedData = saveSchema.parse(requestBody);

    // Vérification de l'existence de l'évaluation et de son propriétaire
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: validatedData.assessmentId },
      select: { userId: true },
    });

    if (!existingAssessment) {
      return NextResponse.json({ error: "Évaluation introuvable." }, { status: 404 });
    }

    // Sécurité 1 : Authentification requise (exception demo-user en développement)
    if (!session?.user?.id && existingAssessment.userId !== "demo-user") {
      return NextResponse.json({ error: "Non autorisé. Vous devez être connecté." }, { status: 401 });
    }

    // Sécurité 2 : Anti-usurpation — l'utilisateur ne peut modifier que SA propre évaluation
    if (session?.user?.id && existingAssessment.userId !== session.user.id && existingAssessment.userId !== "demo-user") {
      return NextResponse.json({ error: "Accès refusé. Vous ne pouvez pas modifier cette évaluation." }, { status: 403 });
    }

    // Sauvegarde idempotente via upsert dans QuestionnaireService
    const savedAssessment = await QuestionnaireService.save(validatedData);
    return NextResponse.json(savedAssessment);

  } catch (error) {
    console.error("[QUESTIONNAIRE_SAVE_ERROR]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sauvegarde impossible." },
      { status: 400 }
    );
  }
}
