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

    // Mise à jour du statut du défi
    await prisma.prescriptionItem.update({
      where: { id: prescriptionItemId },
      data: { status: "COMPLETED" },
    });

    // Détermination du nombre de points à attribuer (lecture depuis le JSON de l'item ou fallback par défaut)
    const libraryMetadata = item.libraryItem?.data as any;
    const pointsToAward = libraryMetadata?.points ? Number(libraryMetadata.points) : GamificationService.POINTS_PER_CHALLENGE;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: pointsToAward } },
    });

    const newLevel = calculateLevel(updatedUser.points).level;

    await prisma.userStats.upsert({
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
      }
    });

    await EventLogger.log({
      userId,
      eventType: "micro_challenge_completed",
      eventData: { prescriptionItemId, pointsEarned: pointsToAward },
    });

    const newlyUnlockedBadges = await this.checkAndAwardBadges(userId, updatedUser.points);

    return {
      success: true,
      pointsEarned: pointsToAward,
      totalPoints: updatedUser.points,
      newBadges: newlyUnlockedBadges,
    };
  }

  /**
   * Vérifie si le total de points actuel de l'utilisateur lui permet de débloquer de nouveaux badges
   * qu'il ne possède pas encore, puis les lui attribue en base de données.
   * 
   * @param userId - L'identifiant de l'utilisateur
   * @param currentPoints - Le solde de points actuel de l'utilisateur (après une action)
   * @returns Le tableau des badges qui viennent d'être débloqués
   */
  private static async checkAndAwardBadges(userId: string, currentPoints: number) {
    // Récupération des badges éligibles que l'utilisateur ne possède pas encore
    const eligibleBadges = await prisma.badge.findMany({
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
      await prisma.userBadge.create({
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
        type: "CHALLENGE_REMINDER", // Faute de type BADGE on utilise un existant ou on pourrait rajouter BADGE_UNLOCKED
        title: "Nouveau badge débloqué ! 🏆",
        message: `Félicitations, vous avez obtenu le badge : ${badge.name}`,
        actionLink: "/mon-profil"
      });
    }

    return unlockedBadges;
  }
}
