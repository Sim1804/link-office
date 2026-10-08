/**
 * @file matching-service.ts
 * @module lib/binome/matching-service
 * @description Moteur de jumelage relationnel pour le programme de Binôme Link Office.
 *
 * FORMULE ET BARÈME DE COMPATIBILITÉ (Alignement Spécification & Mémoire) :
 * - Base forfaitaire de départ : 50 points
 * - Bonus de synergie / complémentarité (force de l'un = faiblesse de l'autre) :
 *   `synergyWeight * 0.5` = 60 * 0.5 = +30 points
 * - Bonus de similarité (même dimension forte d'excellence) :
 *   `similarityWeight * 0.5` = 40 * 0.5 = +20 points
 * - Seuil minimal d'éligibilité : 75 points
 *
 * CONSÉQUENCES DU SEUIL 75 :
 * - Synergie seule : 50 + 30 = 80 pts (>= 75 -> ÉLIGIBLE)
 * - Similarité seule : 50 + 20 = 70 pts (< 75 -> REFUSÉ car seuil non atteint)
 * - Synergie + Similarité : 50 + 30 + 20 = 100 pts (>= 75 -> ÉLIGIBLE, MATCH PARFAIT)
 * - Ni l'un ni l'autre : 50 pts (< 75 -> REFUSÉ)
 */

import { prisma } from "@/lib/prisma";

export interface MatchingConfig {
  minimumThreshold: number;
  synergyWeight: number;
  similarityWeight: number;
  baseScore?: number;
}

/** Configuration par défaut si aucun enregistrement SystemConfig n'existe en BDD. */
export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  minimumThreshold: 75,
  synergyWeight: 60,
  similarityWeight: 40,
  baseScore: 50,
};

export interface AssessmentDimensions {
  bestDimension?: string | null;
  weakDimension?: string | null;
}

export interface CompatibilityResult {
  score: number;
  isEligible: boolean;
  hasSynergy: boolean;
  hasSimilarity: boolean;
  reasons: string[];
}

/**
 * Calcule le score de compatibilité entre deux profils relationnels (fonction pure testable).
 */
export function calculateCompatibilityScore(
  myResult: AssessmentDimensions,
  candidateResult: AssessmentDimensions,
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG
): CompatibilityResult {
  let score = config.baseScore ?? 50;
  let hasSynergy = false;
  let hasSimilarity = false;
  const reasons: string[] = [];

  // Synergie : complémentarité entre la dimension forte de l'un et la dimension faible de l'autre (+30 pts)
  if (
    myResult.bestDimension &&
    candidateResult.weakDimension &&
    candidateResult.bestDimension &&
    myResult.weakDimension &&
    (candidateResult.bestDimension === myResult.weakDimension ||
      candidateResult.weakDimension === myResult.bestDimension)
  ) {
    score += config.synergyWeight * 0.5;
    hasSynergy = true;
    reasons.push("Complémentarité forte/faible (Synergie)");
  }

  // Similarité : même dimension d'excellence relationnelle partagée (+20 pts)
  if (
    myResult.bestDimension &&
    candidateResult.bestDimension &&
    candidateResult.bestDimension === myResult.bestDimension
  ) {
    score += config.similarityWeight * 0.5;
    hasSimilarity = true;
    reasons.push("Même dimension d'excellence relationnelle (Similarité)");
  }

  const isEligible = score >= config.minimumThreshold;

  return {
    score,
    isEligible,
    hasSynergy,
    hasSimilarity,
    reasons,
  };
}

/**
 * Charge la configuration du matching depuis la BDD (SystemConfig).
 * Utilise les valeurs par défaut si aucune configuration n'existe.
 */
async function getMatchingConfig(): Promise<MatchingConfig> {
  try {
    const record = await prisma.systemConfig.findUnique({
      where: { key: "matching-settings" },
    });
    if (record?.value && typeof record.value === "object") {
      return { ...DEFAULT_MATCHING_CONFIG, ...(record.value as object) };
    }
  } catch {
    // En cas d'erreur BDD, on utilise les valeurs par défaut
  }
  return DEFAULT_MATCHING_CONFIG;
}

export class MatchingService {
  /**
   * Toggles the user's matching opt-in status.
   */
  static async setOptIn(userId: string, optIn: boolean): Promise<boolean> {
    await prisma.user.update({
      where: { id: userId },
      data: { matchingOptIn: optIn }
    });
    return optIn;
  }

  /**
   * Finds a relational partner for the user based on their campaign and IQRH results.
   * If a partner is found, creates a PENDING RelationalPair / BinomeSuggestion.
   */
  static async findAndInvitePartner(userId: string): Promise<{ success: boolean; partnerName?: string; message?: string }> {
    // 1. Get current user's latest assessment and campaign
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        assessments: {
          where: { status: "SUBMITTED" },
          orderBy: { submittedAt: 'desc' },
          take: 1,
          include: {
            campaign: true,
            result: true
          }
        }
      }
    });

    if (!user || user.assessments.length === 0) {
      return { success: false, message: "Vous devez d'abord compléter votre questionnaire IQRH pour participer." };
    }

    const latestAssessment = user.assessments[0];
    const campaign = latestAssessment.campaign;
    
    // Check campaign configuration if any
    const campaignConfig = (campaign as any)?.questionnaireConfig as any;
    if (campaign && campaignConfig?.binomeEnabled === false) {
      return { success: false, message: "Le module Binôme Relationnel a été désactivé pour cette campagne." };
    }

    // Load global matching config from DB or defaults
    const globalConfig = await getMatchingConfig();

    // 2. Exclude users with whom we already have a suggestion or pair
    const existingPairs = await prisma.binome.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });
    const existingSuggestions = await prisma.binomeSuggestion.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });
    const excludedUserIds = new Set([
      ...existingPairs.flatMap((p) => [p.userAId, p.userBId]),
      ...existingSuggestions.flatMap((s) => [s.userAId, s.userBId]),
      userId,
    ]);

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedUserIds) },
        organizationId: user.organizationId,
        matchingOptIn: true,
        assessments: {
          some: {
            status: "SUBMITTED",
            ...(campaign ? { campaignId: campaign.id } : {}),
          },
        },
      },
      include: {
        assessments: {
          where: { status: "SUBMITTED" },
          orderBy: { submittedAt: "desc" },
          take: 1,
          include: { result: true },
        },
      },
    });

    if (candidates.length === 0) {
      return { success: false, message: "Aucun collègue disponible n'a encore rejoint le programme de binôme." };
    }

    // 3. Matching algorithm using pure scoring function
    const myResult = latestAssessment.result;
    if (!myResult) {
      return { success: false, message: "Résultats d'évaluation introuvables." };
    }
    
    let bestMatch: any = null;
    let bestScore = 0;
    let foundSynergy = false;

    for (const candidate of candidates) {
      if (campaignConfig?.requireSameDepartment && candidate.organizationId !== user.organizationId) {
        continue;
      }

      const candidateResult = (candidate as any).assessments?.[0]?.result;
      if (!candidateResult) continue;

      const comp = calculateCompatibilityScore(myResult, candidateResult, globalConfig);

      if (comp.isEligible && comp.score > bestScore) {
        bestScore = comp.score;
        bestMatch = candidate;
        foundSynergy = comp.hasSynergy;
      }
    }

    if (!bestMatch) {
      return { success: false, message: `Aucun partenaire ne correspond à vos critères (Seuil de compatibilité à ${globalConfig.minimumThreshold}% non atteint).` };
    }

    // 4. Create the PENDING BinomeSuggestion
    await prisma.binomeSuggestion.create({
      data: {
        userAId: userId,
        userBId: bestMatch.id,
        campaignId: campaign?.id,
        compatibilityScore: bestScore,
        compatibilityReasons: foundSynergy ? ["Synergie sur les dimensions forte/faible"] : ["Complémentarité générale (Similarité)"],
        irisRecommendation: "IRIS a identifié une compatibilité basée sur les paramètres de l'algorithme.",
        responseA: "ACCEPTED", // Auto-accept for the initiator
        responseB: "PENDING",
        status: "PENDING"
      }
    });

    return {
      success: true,
      partnerName: `${bestMatch.firstName} ${bestMatch.lastName[0]}.`,
      message: `Une suggestion de binôme avec ${bestMatch.firstName} (${bestScore}% de compatibilité) a été envoyée !`
    };
  }
}
