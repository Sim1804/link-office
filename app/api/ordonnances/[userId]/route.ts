/**
 * @file route.ts
 * @module app/api/ordonnances/[userId]
 * @description Route API pour récupérer l'ordonnance relationnelle d'un utilisateur.
 *
 * L'ordonnance est la liste personnalisée de recommandations et de micro-défis
 * générée par le `PrescriptionService` après la soumission du questionnaire IQRH.
 *
 * @method GET
 * @param userId - L'identifiant de l'utilisateur (paramètre d'URL dynamique)
 * @returns {{ prescription: Prescription | null }} — L'ordonnance avec ses items
 * @throws {500} En cas d'erreur serveur interne
 *
 * @see lib/iqrh/prescription-service.ts — Méthode `byUser()` utilisée ici
 */

import { NextResponse } from "next/server";
import { PrescriptionService } from "@/lib/iqrh/prescription-service";

/**
 * Récupère l'ordonnance relationnelle (recommandations + défis) d'un utilisateur.
 *
 * @param _ - La requête HTTP (non utilisée, requis par Next.js)
 * @param context - Contexte Next.js avec les paramètres d'URL dynamiques
 */
export async function GET(
  _: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const prescription = await PrescriptionService.byUser(userId);
    return NextResponse.json({ prescription });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
