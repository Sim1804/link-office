import { getMockChallenges } from "../microChallenges";
import { getPartnersForDimension } from "../partners";
import { getMockRecommendations } from "../recommendations";
import { getMockResult } from "../iqrh";
import { mockUsers } from "../users";
import { daysFromNow, percent } from "../utils/helpers";

export enum PrescriptionType { Prioritaire = "prioritaire", Accompagnement = "accompagnement", Preventive = "préventive" }
export interface Ordonnance { id: string; userId: string; type: PrescriptionType; priority: 1 | 2 | 3; status: "active" | "completed"; mainGoal: string; secondaryGoals: readonly string[]; startDate: string; endDate: string; progress: number; nextAction: string; recommendationIds: readonly string[]; partnerIds: readonly string[]; challengeIds: readonly string[]; }
export const mockOrdonnances: readonly Ordonnance[] = mockUsers.map((user) => { const result = getMockResult(user.id)!; const weakest = [...result.dimensions].sort((a, b) => a.score - b.score)[0]!; const recommendations = getMockRecommendations(user.id); const challenges = getMockChallenges(user.id); const completed = challenges.filter((challenge) => challenge.status === "completed").length; const type = result.score < 40 ? PrescriptionType.Prioritaire : result.score > 75 ? PrescriptionType.Preventive : PrescriptionType.Accompagnement; return { id: `ord_${user.id}`, userId: user.id, type, priority: result.score < 40 ? 1 : result.score < 60 ? 2 : 3, status: "active", mainGoal: `Renforcer ${weakest.dimension.replace(/([A-Z])/g, " $1").toLowerCase()}`, secondaryGoals: ["Installer une action relationnelle régulière", "Mobiliser une ressource de soutien"], startDate: "2026-07-01T09:00:00.000Z", endDate: daysFromNow(18), progress: percent(completed, challenges.length), nextAction: challenges.find((challenge) => challenge.status !== "completed")!.title, recommendationIds: recommendations.map((item) => item.id), partnerIds: getPartnersForDimension(weakest.dimension).slice(0, 3).map((item) => item.id), challengeIds: challenges.map((item) => item.id) }; });
export const getMockOrdonnance = (userId: string): Ordonnance | undefined => mockOrdonnances.find((item) => item.userId === userId);
