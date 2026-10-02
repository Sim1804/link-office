import { API_URL } from "./api";

async function request<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.error || body.detail || `Erreur questionnaire (${response.status})`;
    console.error("MOBILE QUESTIONNAIRE API ERROR", { path, status: response.status, detail });
    throw new Error(detail);
  }
  return body as T;
}

export type AdaptiveQuestion = { id: string; text: string; moduleTitle: string };
export type MobileResults = {
  completedAt: string;
  globalScore: number;
  weather: string;
  summary: string;
  priorityDimension: string;
  dimensions: Array<{ label: string; score: number; interpretation: string }>;
  strengths: string[];
  watchpoints: string[];
  profile: { name: string; summary: string } | null;
};

export async function startQuestionnaire(token: string, userId: string) {
  // `userId` is sent only for backward compatibility with the deployed API.
  // The current backend derives the effective user solely from the bearer token.
  return request<{ id: string; adaptiveQuestions: AdaptiveQuestion[] }>("/api/mobile/questionnaire/start", token, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}
export async function saveAnswer(token: string, assessmentId: string, questionId: string, value: number) {
  return request("/api/mobile/questionnaire/save", token, { method: "POST", body: JSON.stringify({ assessmentId, questionId, value }) });
}
export async function submitQuestionnaire(token: string, assessmentId: string) {
  return request<any>("/api/mobile/questionnaire/submit", token, { method: "POST", body: JSON.stringify({ assessmentId }) });
}
export async function getResults(token: string) {
  return request<MobileResults>("/api/mobile/results", token);
}
