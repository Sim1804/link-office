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

export interface BreakdownItem<T = any> {
  label: string;
  count: number;
  value?: T;
  isMasked?: boolean;
  suppressionType?: "PRIMARY" | "SECONDARY";
}

/**
 * Applique la suppression complémentaire (Secondary Suppression / Anti-recoupement).
 *
 * PROBLÈME RÉSOLU :
 * Si une ventilation comporte un total connu (ex: 20) et que seule 1 cellule est masquée
 * (ex: CDI = 19, CDD = 1 avec seuil 5), masquer CDD seul permet à un attaquant de déduire
 * immédiatement CDD = 20 - 19 = 1.
 *
 * RÈGLE CNIL / STATISTIQUE PUBLIQUE :
 * Si exactement UNE SEULE cellule est masquée (< 5, suppression primaire), il est obligatoire
 * de masquer AU MOINS UNE DEUXIÈME cellule (la plus petite des cellules non masquées)
 * pour rendre l'équation à 2 inconnues non résoluble.
 */
export function applySecondarySuppression<T = any>(
  items: Array<{ label: string; count: number; value?: T }>
): Array<BreakdownItem<T>> {
  if (!items || items.length === 0) return [];

  // 1. Suppression primaire : masquer toutes les cellules < ANONYMITY_THRESHOLD
  const result: Array<BreakdownItem<T>> = items.map((item) => {
    if (item.count < ANONYMITY_THRESHOLD) {
      return {
        label: item.label,
        count: 0,
        value: undefined,
        isMasked: true,
        suppressionType: "PRIMARY",
      };
    }
    return {
      label: item.label,
      count: item.count,
      value: item.value,
      isMasked: false,
    };
  });

  const primaryMaskedCount = result.filter((r) => r.isMasked).length;

  // 2. Si exactement 1 cellule est masquée et qu'il reste au moins 1 cellule non masquée :
  // On doit masquer une 2e cellule (suppression secondaire) pour empêcher la déduction par soustraction.
  if (primaryMaskedCount === 1) {
    let minNonMaskedIndex = -1;
    let minCount = Infinity;

    result.forEach((item, index) => {
      if (!item.isMasked && item.count < minCount) {
        minCount = item.count;
        minNonMaskedIndex = index;
      }
    });

    if (minNonMaskedIndex !== -1) {
      result[minNonMaskedIndex] = {
        ...result[minNonMaskedIndex],
        count: 0,
        value: undefined,
        isMasked: true,
        suppressionType: "SECONDARY",
      };
    }
  }

  return result;
}

/**
 * Détecte le risque d'attribut homogène (Homogeneity Attack / l-diversity).
 *
 * PROBLÈME RÉSOLU :
 * Si un groupe de 5 collaborateurs satisfait le seuil k >= 5, mais que 100% (ou >= 90%)
 * partagent la même modalité sensible (ex: tous "Risque critique" ou "Détresse"),
 * l'attaquant sait avec certitude que chaque membre du groupe a cet attribut.
 *
 * RÈGLE :
 * Si la proportion de la modalité dominante dépasse `maxHomogeneityRatio` (par défaut 0.9 = 90%),
 * le groupe est signalé à risque et la restitution doit être masquée ou neutralisée.
 */
export function checkHomogeneityRisk(
  items: Array<{ label: string; count: number }>,
  totalCount: number,
  maxHomogeneityRatio = 0.9
): {
  hasHomogeneityRisk: boolean;
  dominantLabel?: string;
  dominantRatio?: number;
  reason?: string;
} {
  if (totalCount <= 0 || !items || items.length === 0) {
    return { hasHomogeneityRisk: false };
  }

  for (const item of items) {
    const ratio = item.count / totalCount;
    if (ratio >= maxHomogeneityRatio) {
      return {
        hasHomogeneityRisk: true,
        dominantLabel: item.label,
        dominantRatio: Math.round(ratio * 100) / 100,
        reason: `Risque d'inférence par homogénéité : ${Math.round(ratio * 100)}% des membres du sous-groupe partagent la modalité « ${item.label} ». Restitution bloquée pour préserver la vie privée.`,
      };
    }
  }

  return { hasHomogeneityRisk: false };
}
