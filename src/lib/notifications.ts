import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionLink?: string;
}

export class NotificationService {
  /**
   * Envoie une notification In-App à un utilisateur.
   */
  static async send({ userId, type, title, message, actionLink }: SendNotificationParams) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          actionLink,
        },
      });
      
      // Ici, on pourrait ajouter l'envoi d'un push WebPush, Websocket ou Email (SendGrid/Resend)
      // si l'utilisateur a activé l'option correspondante.

      return { success: true, notification };
    } catch (error) {
      console.error("[NotificationService] Erreur lors de l'envoi :", error);
      return { success: false, error };
    }
  }

  /**
   * Marque une notification comme lue.
   */
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId }, // userId for security
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
