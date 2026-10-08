/**
 * @file privacy.ts
 * @module lib/privacy
 * @description Centralisation des règles de confidentialité, du seuil de k-anonymat
 * et de protection contre le recoupement d'agrégats (différence de requêtes).
 *
 * Conforme aux préconisations CNIL / RGPD :
 * - Aucun agrégat ou sous-groupe ne peut être divulgué si son effectif est inférieur à ANONYMITY_THRESHOLD (5).
 * - Règle stricte de suppression : en cas de combinaison de filtres produisant un sous-groupe < 5,
 *   la restitution est bloquée pour interdire l'inférence individuelle par différence.
 * - Les cellules ou segments spécifiques d'un tableau ayant un effectif < 5 sont masqués.
 */

import { NextResponse } from "next/server";

/**
 * Seuil minimal universel de k-anonymat pour la plateforme LinkOffice (B2B, B2G, Baromètre, Observatoire).
 */
export const ANONYMITY_THRESHOLD = 5;

/**
 * Vérifie si un échantillon respecte le seuil minimal de k-anonymat.
 */
export function isSampleAnonymized(count: number): boolean {
  return count >= ANONYMITY_THRESHOLD;
}

/**
 * Masque une valeur statistique si l'effectif sous-jacent est inférieur au seuil de k-anonymat.
 */
export function anonymizeCell<T>(count: number, value: T): T | null {
  return count >= ANONYMITY_THRESHOLD ? value : null;
}

/**
 * Valide si un échantillon filtré (potentiellement issu de filtres croisés) peut être restitué.
 * Si le sous-groupe compte entre 1 et 4 répondants, le blocage est déclenché.
 */
export function validateCrossFilterSample(count: number): {
  allowed: boolean;
  anonymityBlocked: boolean;
  threshold: number;
  respondentCount: number;
  reason?: string;
} {
  if (count > 0 && count < ANONYMITY_THRESHOLD) {
    return {
      allowed: false,
      anonymityBlocked: true,
      threshold: ANONYMITY_THRESHOLD,
      respondentCount: count,
      reason: `Effectif insuffisant pour garantir l'anonymat (seuil légal k >= ${ANONYMITY_THRESHOLD}). Ce sous-groupe compte ${count} répondant(s).`,
    };
  }

  return {
    allowed: true,
    anonymityBlocked: false,
    threshold: ANONYMITY_THRESHOLD,
    respondentCount: count,
  };
}

/**
 * Réponse standardisée Next.js lors d'un blocage pour protection de l'anonymat.
 */
export function createAnonymityBlockedResponse(respondentCount: number, customMessage?: string) {
  return NextResponse.json(
    {
      anonymityBlocked: true,
      respondentCount,
      threshold: ANONYMITY_THRESHOLD,
      message:
        customMessage ||
        `Pour garantir le strict anonymat des répondants (norme CNIL k >= ${ANONYMITY_THRESHOLD}), les résultats ne sont consultables qu'à partir de ${ANONYMITY_THRESHOLD} évaluations complétées. Actuellement : ${respondentCount}.`,
    },
    { status: 200 }
  );
}
