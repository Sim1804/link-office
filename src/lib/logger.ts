import { prisma } from "@/lib/prisma";

export type EventType = 
  | "questionnaire_started"
  | "questionnaire_completed"
  | "iqrh_calculated"
  | "icr_calculated"
  | "profile_generated"
  | "recommendation_generated"
  | "ordonnance_created"
  | "micro_challenge_started"
  | "micro_challenge_completed"
  | "iris_message_sent"
  | "binome_match_created"
  | "binome_checkin_completed"
  | "partner_clicked"
  | "program_clicked"
  | "pdf_exported"
  | "badge_unlocked";

export interface LogEventParams {
  userId?: string;
  organizationId?: string;
  campaignId?: string;
  eventType: EventType | string;
  eventData?: any;
}

export class EventLogger {
  /**
   * Enregistre un événement dans la timeline système (EventLog).
   * Utilisé pour les statistiques d'usage et pour nourrir l'algorithme d'IA.
   */
  static async log({ userId, organizationId, campaignId, eventType, eventData = {} }: LogEventParams) {
    try {
      await prisma.eventLog.create({
        data: {
          userId,
          organizationId,
          campaignId,
          eventType,
          eventData,
        }
      });
    } catch (error) {
      console.error("[EventLogger] Erreur lors de l'enregistrement de l'événement :", error);
      // Ne pas bloquer l'exécution si le log échoue
    }
  }
}
