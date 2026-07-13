import { mockMicroChallenges } from "../microChallenges";
import { mockResults } from "../iqrh";
import { mockUsers } from "../users";

export interface AnalyticsSummary { totalUsers: number; averageIqrh: number; premiumUsers: number; challengeCompletionRate: number; }
export const mockAnalytics: AnalyticsSummary = { totalUsers: mockUsers.length, averageIqrh: Math.round(mockResults.reduce((sum, result) => sum + result.score, 0) / mockResults.length), premiumUsers: mockUsers.filter((user) => user.subscription === "premium").length, challengeCompletionRate: Math.round((mockMicroChallenges.filter((challenge) => challenge.status === "completed").length / mockMicroChallenges.length) * 100) };
