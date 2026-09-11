import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

const CONFIG_PATH = path.join(process.cwd(), "config", "matching-settings.json");
function getMatchingConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    } catch { return null; }
  }
  return {
    minimumThreshold: 75,
    synergyWeight: 60,
    similarityWeight: 40,
  };
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
   * If a partner is found, creates a PENDING RelationalPair.
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

    if (!user) return { success: false, message: "Utilisateur introuvable." };
    if (!user.matchingOptIn) return { success: false, message: "Vous n'avez pas autorisé le matching." };

    const latestAssessment = user.assessments[0];
    if (!latestAssessment || !latestAssessment.result) {
      return { success: false, message: "Vous devez avoir complété un bilan IQRH pour trouver un binôme." };
    }

    const campaign = latestAssessment.campaign;
    const isB2c = !campaign;
    
    // Vérification de la configuration de campagne (si B2B2C)
    const campaignConfig = campaign?.questionnaireConfig as any;
    if (campaign && campaignConfig?.binomeEnabled === false) {
      return { success: false, message: "Le module Binôme Relationnel a été désactivé par l'administrateur de cette campagne." };
    }

    // Check if the user is eligible (PREMIUM_PLUS for campaigns, PREMIUM for B2C)
    if (campaign && campaign.offer !== "PREMIUM_PLUS") {
      return { success: false, message: "Votre campagne n'inclut pas le module Binôme Relationnel (PREMIUM_PLUS requis)." };
    }
    if (isB2c && user.subscription !== "PREMIUM" && user.subscription !== "PREMIUM_PLUS") {
      return { success: false, message: "Le module Binôme est réservé aux abonnements Premium." };
    }

    // Récupération de la configuration globale SuperAdmin
    const globalConfig = getMatchingConfig();

    // 2. Find candidates
    // Exclude users with whom we already have a suggestion (PENDING, ACCEPTED) or active binome
    const existingPairs = await prisma.binome.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId }
        ]
      }
    });
    const existingSuggestions = await prisma.binomeSuggestion.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId }
        ],
        status: { in: ["PENDING", "ACCEPTED"] }
      }
    });
    const excludedUserIds = new Set([
      ...existingPairs.flatMap(p => [p.userAId, p.userBId]),
      ...existingSuggestions.flatMap(s => [s.userAId, s.userBId])
    ]);
    excludedUserIds.add(userId);

    // Query candidates
    const candidates = await prisma.user.findMany({
      where: {
        matchingOptIn: true,
        id: { notIn: Array.from(excludedUserIds) },
        assessments: {
          some: {
            status: "SUBMITTED",
            ...(isB2c ? { campaignId: null } : { campaignId: campaign.id })
          }
        },
        ...(isB2c ? { subscription: { in: ["PREMIUM", "PREMIUM_PLUS"] } } : {})
      },
      include: {
        assessments: {
          where: { status: "SUBMITTED" },
          orderBy: { submittedAt: 'desc' },
          take: 1,
          include: { result: true }
        }
      }
    });

    if (candidates.length === 0) {
      return { success: false, message: "Aucun partenaire disponible pour le moment dans votre périmètre." };
    }

    // 3. Simple matching algorithm with weights
    const myResult = latestAssessment.result;
    
    let bestMatch = null;
    let bestScore = 0;
    let foundSynergy = false;

    for (const candidate of candidates) {
      // Ignorer si requireSameDepartment est activé mais que les départements diffèrent (simulé si champ manquant)
      if (campaignConfig?.requireSameDepartment && candidate.organizationId !== user.organizationId) {
         // On utilise organizationId comme proxy pour le moment
         continue;
      }

      const candidateResult = candidate.assessments[0]?.result;
      if (!candidateResult) continue;

      let score = 50; // Base de départ
      let isSynergy = false;

      // Calcul Synergie
      if (candidateResult.bestDimension === myResult.weakDimension || candidateResult.weakDimension === myResult.bestDimension) {
        score += (globalConfig.synergyWeight * 0.5); 
        isSynergy = true;
      }

      // Calcul Similarité
      if (candidateResult.bestDimension === myResult.bestDimension) {
        score += (globalConfig.similarityWeight * 0.5);
      }

      // Est-ce le meilleur candidat dépassant le seuil global ?
      if (score >= globalConfig.minimumThreshold && score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
        foundSynergy = isSynergy;
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
      partnerName: bestMatch.firstName,
      message: `Partenaire trouvé${foundSynergy ? ' avec une belle synergie' : ''} ! Invitation envoyée à ${bestMatch.firstName}.`
    };
  }
}
