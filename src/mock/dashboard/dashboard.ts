import { getMockChallenges } from "../microChallenges";
import { getMockResult } from "../iqrh";
import { mockUsers } from "../users";

export interface Badge { id: string; label: string; earnedAt: string; }
export interface Progress { userId: string; scoreDelta: number; activeDays: number; completionRate: number; }
export interface HistoryEvent { id: string; userId: string; type: "assessment_completed" | "prescription_generated" | "challenge_completed"; occurredAt: string; label: string; }
export interface Dashboard { userId: string; result: ReturnType<typeof getMockResult>; progress: Progress; badges: readonly Badge[]; history: readonly HistoryEvent[]; }
export const mockDashboards: readonly Dashboard[] = mockUsers.map((user, index) => { const challenges = getMockChallenges(user.id); const complete = challenges.filter((item) => item.status === "completed").length; return { userId: user.id, result: getMockResult(user.id), progress: { userId: user.id, scoreDelta: 2 + (index % 9), activeDays: 3 + (index % 20), completionRate: Math.round((complete / challenges.length) * 100) }, badges: complete > 0 ? [{ id: `badge_${user.id}`, label: "Premier pas", earnedAt: "2026-07-08T09:00:00.000Z" }] : [], history: [{ id: `event_assessment_${user.id}`, userId: user.id, type: "assessment_completed", occurredAt: "2026-07-01T09:09:00.000Z", label: "Questionnaire IQRH complété" }, { id: `event_prescription_${user.id}`, userId: user.id, type: "prescription_generated", occurredAt: "2026-07-01T09:10:00.000Z", label: "Ordonnance relationnelle générée" }] }; });
export const getMockDashboard = (userId: string): Dashboard | undefined => mockDashboards.find((item) => item.userId === userId);
