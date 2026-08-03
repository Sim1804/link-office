import { prisma } from "@/lib/prisma";

export class GamificationService {
  static readonly POINTS_PER_CHALLENGE = 50;

  /**
   * Marque un défi comme complété, attribue des points à l'utilisateur,
   * et débloque d'éventuels badges.
   */
  static async completeChallenge(userId: string, prescriptionItemId: string) {
    // 1. Vérifier si l'item existe et appartient bien à l'utilisateur
    const item = await prisma.prescriptionItem.findUnique({
      where: { id: prescriptionItemId },
      include: { prescription: true, libraryItem: true },
    });

    if (!item || item.prescription.userId !== userId) {
      throw new Error("Défi introuvable ou non autorisé.");
    }

    if (item.status === "COMPLETED") {
      throw new Error("Défi déjà complété.");
    }

    // 2. Marquer comme complété
    await prisma.prescriptionItem.update({
      where: { id: prescriptionItemId },
      data: { status: "COMPLETED" },
    });

    // 3. Ajouter les points à l'utilisateur
    const pointsData = item.libraryItem?.data as any;
    const pointsToAward = pointsData?.points ? Number(pointsData.points) : GamificationService.POINTS_PER_CHALLENGE;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: pointsToAward } },
    });

    // 4. Vérifier les badges débloqués
    const newBadges = await this.checkAndAwardBadges(userId, updatedUser.points);

    return {
      success: true,
      pointsEarned: pointsToAward,
      totalPoints: updatedUser.points,
      newBadges,
    };
  }

  /**
   * Vérifie si les points actuels permettent de débloquer de nouveaux badges
   */
  private static async checkAndAwardBadges(userId: string, currentPoints: number) {
    // Badges disponibles que l'utilisateur pourrait débloquer avec ses points actuels
    const availableBadges = await prisma.badge.findMany({
      where: {
        pointsRequired: { lte: currentPoints },
        users: {
          none: { userId: userId }, // Seulement ceux non possédés
        },
      },
    });

    const newBadgesUnlocked = [];

    // Attribuer les badges
    for (const badge of availableBadges) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      });
      newBadgesUnlocked.push(badge);
    }

    return newBadgesUnlocked;
  }
}
