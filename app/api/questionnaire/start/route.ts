/**
 * @file route.ts
 * @module app/api/questionnaire/start
 * @description Route API pour démarrer ou reprendre une évaluation IQRH (Assessment).
 *
 * Cette route est appelée quand l'utilisateur arrive sur la page du questionnaire.
 * Elle initialise un Assessment en statut "DRAFT" dans la base de données
 * (ou retourne le brouillon existant si l'utilisateur a déjà commencé).
 *
 * Sécurités implémentées :
 * - L'utilisateur doit être authentifié (sauf pour le compte demo en développement)
 * - Un utilisateur ne peut pas démarrer une évaluation au nom d'un autre (anti-usurpation)
 *
 * @method POST
 * @body {{ userId: string }} — L'identifiant de l'utilisateur (doit correspondre à la session)
 * @returns {Assessment} — L'Assessment DRAFT existant ou nouvellement créé
 * @throws {401} Si l'utilisateur n'est pas authentifié
 * @throws {403} Si le userId du body ne correspond pas à la session active
 * @throws {400} Si les données du body sont invalides (Zod)
 */

import { NextResponse } from "next/server";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
import { startSchema } from "@/lib/iqrh/schemas";
import { auth } from "@/lib/auth";

/**
 * Initialise ou reprend un brouillon d'évaluation IQRH pour un utilisateur.
 *
 * @param request - La requête HTTP avec le body `{ userId }`
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const requestBody = await request.json();
    const { userId } = startSchema.parse(requestBody);

    // Sécurité 1 : Authentification obligatoire (exception pour le compte demo en dev)
    if (!session?.user?.id && userId !== "demo-user") {
      return NextResponse.json(
        { error: "Non autorisé. Vous devez être connecté." },
        { status: 401 }
      );
    }

    // Sécurité 2 : Anti-usurpation — l'utilisateur ne peut agir qu'en son propre nom
    if (session?.user?.id && userId !== session.user.id && userId !== "demo-user") {
      return NextResponse.json(
        { error: "Accès refusé. Action non permise." },
        { status: 403 }
      );
    }

    const assessment = await QuestionnaireService.start(userId);
    return NextResponse.json(assessment);

  } catch (error) {
    console.error("[QUESTIONNAIRE_START_ERROR]:", error);
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
