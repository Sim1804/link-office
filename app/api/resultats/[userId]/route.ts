/**
 * @file route.ts
 * @module app/api/resultats/[userId]
 * @description Route API pour récupérer le dernier résultat IQRH d'un utilisateur.
 *
 * Retourne le rapport IQRH complet (scores, profils, ordonnance) affiché dans le
 * tableau de bord personnel. Si l'ordonnance est manquante, tente de la générer
 * automatiquement (mécanisme d'auto-réparation).
 *
 * @method GET
 * @param userId - L'identifiant de l'utilisateur (paramètre d'URL dynamique)
 * @returns {IqrhResult | null} — Le résultat IQRH complet ou null si non trouvé
 * @throws {404} Si aucun résultat n'est trouvé pour cet utilisateur
 *
 * @see lib/iqrh/result-service.ts — Méthode `byUser()` qui effectue la requête BDD
 */

import { NextResponse } from "next/server";
import { ResultService } from "@/lib/iqrh/result-service";
import { auth } from "@/lib/auth";

/**
 * Retourne le résultat IQRH le plus récent d'un utilisateur identifié par son `userId`.
 *
 * @param _ - La requête HTTP (non utilisée, paramètre requis par la signature Next.js)
 * @param context - Contexte Next.js contenant les paramètres d'URL dynamiques
 */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.id !== userId && !["SUPER_ADMIN", "ADMIN_B2B"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    const userResult = await ResultService.byUser(userId);
    return NextResponse.json(userResult);
  } catch {
    // Aucun résultat trouvé pour cet utilisateur
    return NextResponse.json({ error: "Résultat introuvable." }, { status: 404 });
  }
}
