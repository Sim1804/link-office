/**
 * @file notifications.ts
 * @module lib/notifications
 * @description Service de gestion des notifications In-App et d'alerte de vigilance.
 *
 * Règles Phase 3.3 :
 * 1. Plafond strict de 2 notifications par semaine et par utilisateur (`WEEKLY_NOTIFICATION_LIMIT = 2`).
 * 2. Détection d'alerte « chute de 15 points » entre deux évaluations consécutives (`checkScoreDropAlert`).
 */

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

/** Plafond maximal de notifications par utilisateur glissant sur 7 jours */
export const WEEKLY_NOTIFICATION_LIMIT = 2;

/** Seuil de chute de score IQRH déclenchant une alerte de vigilance */
export const SCORE_DROP_ALERT_THRESHOLD = 15;

export interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionLink?: string;
  bypassWeeklyLimit?: boolean;
}

export class NotificationService {
  /**
   * Envoie une notification In-App à un utilisateur sous réserve du plafond hebdomadaire.
   */
  static async send({
    userId,
    type,
    title,
    message,
    actionLink,
    bypassWeeklyLimit = false,
  }: SendNotificationParams) {
    try {
      // 1. Contrôle du plafond hebdomadaire (7 jours glissants)
      if (!bypassWeeklyLimit) {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const countLastWeek = await prisma.notification.count({
          where: {
            userId,
            createdAt: { gte: oneWeekAgo },
          },
        });

        if (countLastWeek >= WEEKLY_NOTIFICATION_LIMIT) {
          return {
            success: false,
            rateLimited: true,
            reason: `Plafond hebdomadaire de ${WEEKLY_NOTIFICATION_LIMIT} notifications atteint pour cet utilisateur.`,
          };
        }
      }

      // 2. Création de la notification en BDD
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          actionLink,
        },
      });

      return { success: true, notification };
    } catch (error) {
      console.error("[NotificationService] Erreur lors de l'envoi :", error);
      return { success: false, error };
    }
  }

  /**
   * Vérifie si une baisse de score justifie une alerte (fonction pure testable).
   */
  static isScoreDropEligible(currentScore: number, previousScore: number): boolean {
    return (previousScore - currentScore) >= SCORE_DROP_ALERT_THRESHOLD;
  }

  /**
   * Vérifie si le score global IQRH a chuté d'au moins 15 points entre deux évaluations
   * consécutives et déclenche une notification d'alerte bienveillante si c'est le cas.
   */
  static async checkScoreDropAlert(
    userId: string,
    currentScore: number,
    previousScore: number
  ): Promise<{ alerted: boolean; drop: number; notification?: any }> {
    const drop = previousScore - currentScore;

    if (this.isScoreDropEligible(currentScore, previousScore)) {
      const result = await this.send({
        userId,
        type: "REPORT_AVAILABLE",
        title: "Alerte Équilibre Relationnel",
        message: `Votre score IQRH a fléchi de ${Math.round(drop)} points par rapport à votre précédente évaluation. Prenez un moment pour consulter votre bilan et vos ressources d'accompagnement.`,
        actionLink: "/dashboard",
        bypassWeeklyLimit: true, // Alerte de santé relationnelle prioritaire
      });

      return {
        alerted: true,
        drop,
        notification: result.success ? (result as any).notification : undefined,
      };
    }

    return { alerted: false, drop };
  }

  /**
   * Marque une notification comme lue.
   */
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { status: "READ" },
    });
  }

  /**
   * Récupère toutes les notifications non lues d'un utilisateur.
   */
  static async getUnread(userId: string) {
    return prisma.notification.findMany({
      where: { userId, status: "UNREAD" },
      orderBy: { createdAt: "desc" },
    });
  }
}
