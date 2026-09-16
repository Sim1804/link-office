import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { API_URL } from "./api";

const TOKEN_KEY = "linkoffice.mobile.token";

async function setStoredToken(token: string | null) {
  if (Platform.OS === "web") {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getStoredToken() {
  if (Platform.OS === "web") return localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearStoredToken() {
  await setStoredToken(null);
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL n'est pas configurée.");
  const baseUrl = API_URL.replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    console.error("AUTH NETWORK ERROR", error);
    throw new Error("Impossible de joindre Link Office. Vérifiez votre connexion internet.");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.error || body.detail || `Une erreur est survenue (${response.status}).`;
    console.error("MOBILE AUTH API ERROR", { path, status: response.status, detail });
    throw new Error(detail);
  }
  return body as T;
}

export type MobileUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string | null;
  mustChangePassword: boolean;
};

export type AuthResponse = { token: string; user: MobileUser };

export async function login(email: string, password: string) {
  const result = await request<AuthResponse>("/api/mobile/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setStoredToken(result.token);
  return result.user;
}

export async function register(data: { prenom: string; nom: string; email: string; password: string; codeAccess?: string }) {
  const result = await request<AuthResponse>("/api/mobile/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...data, email: data.email.trim().toLowerCase() }),
  });
  await setStoredToken(result.token);
  return result.user;
}

export async function me(token: string) {
  return request<{ user: MobileUser }>("/api/mobile/auth/me", {}, token);
}

export async function changePassword(token: string, password: string) {
  return request<{ success: boolean }>("/api/mobile/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  }, token);
}

export async function deleteAccount(token: string) {
  return request<{ success: boolean }>("/api/mobile/auth/account", { method: "DELETE" }, token);
}

export async function logout() {
  await clearStoredToken();
}
