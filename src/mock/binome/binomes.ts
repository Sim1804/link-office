import { mockUsers } from "../users";

export interface Binome { id: string; userId: string; partnerUserId: string; compatibilityScore: number; healthScore: number; status: "matching" | "active" | "at_risk"; inactiveDays: number; alertsSent: number; sharedGoal: string; }
export const mockBinomes: readonly Binome[] = mockUsers.filter((_, index) => index % 3 === 0 && index + 1 < mockUsers.length).map((user, pairIndex) => ({ id: `binome_${pairIndex + 1}`, userId: user.id, partnerUserId: mockUsers[pairIndex * 3 + 1]!.id, compatibilityScore: 72 + (pairIndex % 24), healthScore: pairIndex % 8 === 0 ? 55 : 74 + (pairIndex % 20), status: pairIndex % 8 === 0 ? "at_risk" : "active", inactiveDays: pairIndex % 8 === 0 ? 8 : pairIndex % 4, alertsSent: pairIndex % 8 === 0 ? 1 : 0, sharedGoal: "Réaliser trois actions relationnelles ce mois-ci" }));
export const getMockBinome = (userId: string): Binome | undefined => mockBinomes.find((item) => item.userId === userId || item.partnerUserId === userId);
