import { prisma } from "@/lib/prisma";

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
    
    // Check if the user is eligible (PREMIUM_PLUS for campaigns, PREMIUM for B2C)
    if (campaign && campaign.offer !== "PREMIUM_PLUS") {
      return { success: false, message: "Votre campagne n'inclut pas le module Binôme Relationnel (PREMIUM_PLUS requis)." };
    }
    if (isB2c && user.subscription !== "PREMIUM" && user.subscription !== "PREMIUM_PLUS") {
      return { success: false, message: "Le module Binôme est réservé aux abonnements Premium." };
    }

    // 2. Find candidates
    // Exclude users with whom we already have a pair (PENDING, ACCEPTED, or REJECTED)
    const existingPairs = await prisma.relationalPair.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { receiverId: userId }
        ]
      }
    });
    const excludedUserIds = new Set(existingPairs.flatMap(p => [p.initiatorId, p.receiverId]));
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

    // 3. Simple matching algorithm
    // In V1, we match someone whose best dimension matches our weak dimension, or vice versa, to create synergy.
    // If no perfect match, we take the first available.
    const myResult = latestAssessment.result;
    
    let bestMatch = candidates[0];
    let foundSynergy = false;

    for (const candidate of candidates) {
      const candidateResult = candidate.assessments[0]?.result;
      if (!candidateResult) continue;

      if (candidateResult.bestDimension === myResult.weakDimension || candidateResult.weakDimension === myResult.bestDimension) {
        bestMatch = candidate;
        foundSynergy = true;
        break;
      }
    }

    // 4. Create the PENDING pair invitation (system-generated basically, so user is initiator or we just make bestMatch the receiver)
    await prisma.relationalPair.create({
      data: {
        initiatorId: userId,
        receiverId: bestMatch.id,
        status: "PROPOSITION_ENVOYEE"
      }
    });

    return {
      success: true,
      partnerName: bestMatch.firstName,
      message: `Partenaire trouvé${foundSynergy ? ' avec une belle synergie' : ''} ! Invitation envoyée à ${bestMatch.firstName}.`
    };
  }
}
