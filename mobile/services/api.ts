import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
export const API_URL = process.env.EXPO_PUBLIC_API_URL || extra?.apiUrl || "";

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL n'est pas configurée.");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || body.error || `Erreur ${response.status}`);
  return body as T;
}

export async function register(data: { prenom: string; nom: string; email: string; password: string; codeAccess?: string }) {
  return apiFetch<{ user_id: string; email: string; prenom: string; nom: string; role: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
