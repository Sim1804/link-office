import { API_URL } from "./api";

async function request<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || "Erreur réseau");
  return body as T;
}

export type Demographics = {
  gender: string; ageRange: string; country: string; department?: string;
  occupation: string; organizationSize?: string; relationshipStatus: string;
  children: boolean; childrenCount?: number; livingSituation: string;
  livingSituationOther?: string; selectedSituations: string[]; primarySituation?: string;
};

export async function getOnboardingStatus(token: string) {
  return request<{ hasConsent: boolean; hasCompletedDemographics: boolean; hasCompletedIqrh: boolean }>("/api/mobile/onboarding/status", token);
}

export async function saveConsent(token: string, data: { consentInformation: boolean; consentResearch: boolean; consentParticipation: boolean }) {
  return request("/api/mobile/onboarding/consent", token, { method: "POST", body: JSON.stringify(data) });
}

export async function getDemographics(token: string) {
  return request<{ demographic: Demographics | null; availableSituations: string[]; campaignConfig: any }>("/api/mobile/onboarding/demographics", token);
}

export async function saveDemographics(token: string, data: Demographics) {
  return request("/api/mobile/onboarding/demographics", token, { method: "POST", body: JSON.stringify(data) });
}
