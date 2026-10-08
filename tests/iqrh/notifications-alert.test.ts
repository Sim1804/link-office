import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  NotificationService,
  WEEKLY_NOTIFICATION_LIMIT,
  SCORE_DROP_ALERT_THRESHOLD,
} from "@/lib/notifications";

describe("D2. Alerte de chute de 15 points & Plafond Hebdomadaire", () => {
  const timestamp = Date.now();
  const testUserId = `notif-user-test-${timestamp}`;

  beforeAll(async () => {
    await prisma.user.create({
      data: {
        id: testUserId,
        email: `${testUserId}@notif.test`,
        firstName: "Test",
        lastName: "Notif",
        role: "EMPLOYEE",
      },
    });

    // Création de 2 notifications existantes pour cet utilisateur cette semaine
    // (atteinte immédiate du plafond de 2 notifications)
    for (let i = 1; i <= WEEKLY_NOTIFICATION_LIMIT; i++) {
      await prisma.notification.create({
        data: {
          id: `notif-seed-${timestamp}-${i}`,
          userId: testUserId,
          type: "QUESTIONNAIRE_REMINDER",
          title: `Notification précédente ${i}`,
          message: "Notification ordinaire de test",
          createdAt: new Date(),
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  it("bloque les notifications standard lorsque le plafond de 2 notifications est atteint", async () => {
    const result = await NotificationService.send({
      userId: testUserId,
      type: "QUESTIONNAIRE_REMINDER",
      title: "Rappel régulier",
      message: "Ceci est un rappel standard non prioritaire",
      bypassWeeklyLimit: false,
    });

    expect(result.success).toBe(false);
    expect(result.rateLimited).toBe(true);
    expect(result.reason).toContain("Plafond hebdomadaire de 2 notifications atteint");
  });

  it("garantit que l'alerte de santé relationnelle (chute >= 15 pts) contourne le plafond et est bien délivrée", async () => {
    // Chute de 16 points : de 76 à 60 (>= SCORE_DROP_ALERT_THRESHOLD = 15)
    const alertResult = await NotificationService.checkScoreDropAlert(testUserId, 60, 76);

    expect(alertResult.alerted).toBe(true);
    expect(alertResult.drop).toBe(16);
    expect(alertResult.notification).toBeDefined();

    // Vérification de l'enregistrement effectif en base de données PostgreSQL
    const savedNotification = await prisma.notification.findFirst({
      where: {
        userId: testUserId,
        title: "Alerte Équilibre Relationnel",
      },
    });

    expect(savedNotification).not.toBeNull();
    expect(savedNotification?.message).toContain("16 points");
  });

  it("ne déclenche aucune alerte si la baisse est inférieure au seuil de 15 points", async () => {
    // Baisse de 10 points : de 75 à 65 (< 15)
    const normalResult = await NotificationService.checkScoreDropAlert(testUserId, 65, 75);

    expect(normalResult.alerted).toBe(false);
    expect(normalResult.drop).toBe(10);
  });
});
