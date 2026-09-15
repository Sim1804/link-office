import { API_URL } from "./api";

async function request<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || "Erreur questionnaire");
  return body as T;
}

export async function startQuestionnaire(token: string, userId: string) {
  return request<{ id: string }>("/api/mobile/questionnaire/start", token, { method: "POST", body: JSON.stringify({ userId }) });
}
export async function saveAnswer(token: string, assessmentId: string, questionId: string, value: number) {
  return request("/api/mobile/questionnaire/save", token, { method: "POST", body: JSON.stringify({ assessmentId, questionId, value }) });
}
export async function submitQuestionnaire(token: string, assessmentId: string) {
  return request<any>("/api/mobile/questionnaire/submit", token, { method: "POST", body: JSON.stringify({ assessmentId }) });
}
