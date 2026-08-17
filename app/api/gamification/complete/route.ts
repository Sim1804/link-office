/**
 * @file route.ts
 * @module app/api/gamification/complete
 * @description Route API pour valider la complétion d'un micro-défi par l'utilisateur.
 *
 * Cette route est appelée lorsqu'un utilisateur clique sur "Relever le défi" dans
 * le tableau de bord ou quand IRIS valide un défi compatible (`compatible_iris: Oui`).
 *
 * Flux complet :
 * 1. Vérification de l'authentification (session NextAuth)
 * 2. Validation de la présence de l'identifiant du défi
 * 3. Délégation au `GamificationService` qui :
 *    - Marque le défi comme "COMPLETED"
 *    - Crédite les points à l'utilisateur
 *    - Vérifie et débloque les nouveaux badges
 * 4. Retour du résultat (points gagnés, total, badges débloqués)
 *
 * Sécurité : Le `GamificationService` vérifie que le défi appartient bien
 * à l'utilisateur authentifié (pas d'escalade de privilèges possible).
 *
 * @method POST
 * @body {{ prescriptionItemId: string }} — ID du défi à marquer comme complété
 * @returns {{ success: true, pointsEarned: number, totalPoints: number, newBadges: Badge[] }}
 * @throws {401} Si l'utilisateur n'est pas authentifié
 * @throws {400} Si `prescriptionItemId` est absent du body
 * @throws {500} Si le défi est introuvable, déjà complété, ou en cas d'erreur BDD
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GamificationService } from "@/lib/gamification/gamification-service";

/**
 * Valide la complétion d'un micro-défi et attribue les points correspondants.
 *
 * @param request - La requête HTTP entrante avec le body `{ prescriptionItemId }`
 */
export async function POST(request: Request) {
  try {
    // Vérification de la session — seuls les utilisateurs connectés peuvent compléter des défis
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const requestBody = await request.json();
    const { prescriptionItemId } = requestBody;

    if (!prescriptionItemId) {
      return NextResponse.json(
        { error: "L'identifiant du défi est requis." },
        { status: 400 }
      );
    }

    // Délégation de la logique métier (vérification propriété, points, badges)
    const completionResult = await GamificationService.completeChallenge(
      session.user.id,
      prescriptionItemId
    );

    return NextResponse.json(completionResult);

  } catch (error: any) {
    // Loggué avec un préfixe standardisé pour faciliter le filtrage dans les logs serveur
    console.error("[GAMIFICATION_COMPLETE_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne" },
      { status: 500 }
    );
  }
}
