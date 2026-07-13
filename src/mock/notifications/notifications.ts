import { mockUsers } from "../users";

export interface Notification { id: string; userId: string; type: "challenge" | "prescription" | "encouragement" | "binome"; title: string; body: string; read: boolean; createdAt: string; }
export const mockNotifications: readonly Notification[] = mockUsers.flatMap((user, index) => [{ id: `notif_${user.id}_1`, userId: user.id, type: "challenge" as const, title: "Votre défi de la semaine vous attend", body: "Une petite action peut faire une différence.", read: index % 2 === 0, createdAt: "2026-07-10T08:00:00.000Z" }, { id: `notif_${user.id}_2`, userId: user.id, type: "prescription" as const, title: "Votre ordonnance est disponible", body: "Retrouvez vos priorités relationnelles pour les 30 prochains jours.", read: false, createdAt: "2026-07-07T08:00:00.000Z" }]);
export const getMockNotifications = (userId: string): readonly Notification[] => mockNotifications.filter((item) => item.userId === userId);
