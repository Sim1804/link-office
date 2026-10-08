import { prisma } from "@/lib/prisma";
import { EventLogger } from "@/lib/logger";
import { NotificationService } from "@/lib/notifications";
import { calculateLevel } from "@/lib/gamification";

/**
 * Service gérant la logique de gamification de la plateforme.
 * Inclut l'attribution des points et le déblocage dynamique des badges de réussite.
 */
export class GamificationService {
  /** Points par défaut attribués pour la réussite d'un défi si la base de données ne le précise pas. */
  static readonly POINTS_PER_CHALLENGE = 50;

  /**
   * Marque un défi relationnel comme "complété" par l'utilisateur.
   * Cette action attribue les points correspondants au défi, 
   * et vérifie automatiquement si l'utilisateur franchit un palier pour débloquer de nouveaux badges.
   * 
   * @param userId - L'identifiant de l'utilisateur réalisant l'action
   * @param prescriptionItemId - L'identifiant unique du défi (Micro-défi)
   * @returns Un objet de statut contenant le nombre de points gagnés, le nouveau total et la liste des badges fraîchement débloqués.
   */
  static async completeChallenge(userId: string, prescriptionItemId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Mise à jour conditionnelle atomique : garantit l'exclusion mutuelle stricte
      // Seule la première requête concurrente trouve status: { not: "COMPLETED" }
      const updated = await tx.prescriptionItem.updateMany({
        where: {
          id: prescriptionItemId,
          status: { not: "COMPLETED" },
          prescription: { userId },
        },
        data: { status: "COMPLETED" },
      });

      if (updated.count === 0) {
        throw new Error("Défi déjà complété ou non autorisé.");
      }

      // 2. Récupération des métadonnées du défi pour les points
      const item = await tx.prescriptionItem.findUniqueOrThrow({
        where: { id: prescriptionItemId },
        include: { libraryItem: true },
      });

      const libraryMetadata = item.libraryItem?.data as any;
      const pointsToAward = libraryMetadata?.points
        ? Number(libraryMetadata.points)
        : GamificationService.POINTS_PER_CHALLENGE;

      // 3. Crédit atomique des points sur l'utilisateur
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { points: { increment: pointsToAward } },
      });

      const newLevel = calculateLevel(updatedUser.points).level;

      await tx.userStats.upsert({
        where: { userId },
        create: {
          userId,
          totalPoints: updatedUser.points,
          weeklyPoints: pointsToAward,
          monthlyPoints: pointsToAward,
          currentLevel: newLevel,
        },
        update: {
          totalPoints: updatedUser.points,
          weeklyPoints: { increment: pointsToAward },
          monthlyPoints: { increment: pointsToAward },
          currentLevel: newLevel,
        },
      });

      await EventLogger.log({
        userId,
        eventType: "micro_challenge_completed",
        eventData: { prescriptionItemId, pointsEarned: pointsToAward },
      });

      const newlyUnlockedBadges = await this.checkAndAwardBadges(userId, updatedUser.points, tx);

      return {
        success: true,
        pointsEarned: pointsToAward,
        totalPoints: updatedUser.points,
        newBadges: newlyUnlockedBadges,
      };
    });
  }

  /**
   * Vérifie si le total de points actuel de l'utilisateur lui permet de débloquer de nouveaux badges
   * qu'il ne possède pas encore, puis les lui attribue en base de données.
   * 
   * @param userId - L'identifiant de l'utilisateur
   * @param currentPoints - Le solde de points actuel de l'utilisateur (après une action)
   * @returns Le tableau des badges qui viennent d'être débloqués
   */
  private static async checkAndAwardBadges(userId: string, currentPoints: number, tx: any = prisma) {
    // Récupération des badges éligibles que l'utilisateur ne possède pas encore
    const eligibleBadges = await tx.badge.findMany({
      where: {
        pointsRequired: { lte: currentPoints },
        users: {
          none: { userId: userId },
        },
      },
    });

    const unlockedBadges = [];

    // Attribution des nouveaux badges
    for (const badge of eligibleBadges) {
      await tx.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
          source: "MICRO_DEFI",
        },
      });
      unlockedBadges.push(badge);

      await EventLogger.log({
        userId,
        eventType: "badge_unlocked",
        eventData: { badgeId: badge.id, badgeName: badge.name },
      });

      // Notification
      await NotificationService.send({
        userId,
        type: "BADGE_UNLOCKED",
        title: "Nouveau badge débloqué ! 🏆",
        message: `Félicitations, vous avez obtenu le badge : ${badge.name}`,
        actionLink: "/mon-profil"
      });
    }

    return unlockedBadges;
  }
}
