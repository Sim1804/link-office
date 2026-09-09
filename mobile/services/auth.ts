import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { API_URL } from "./api";

const TOKEN_KEY =
  "linkoffice.mobile.token";

async function setStoredToken(
  token: string | null
) {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") {
      throw new Error(
        "Le stockage navigateur n'est pas disponible."
      );
    }

    if (token) {
      window.localStorage.setItem(
        TOKEN_KEY,
        token
      );
    } else {
      window.localStorage.removeItem(
        TOKEN_KEY
      );
    }

    return;
  }

  if (token) {
    await SecureStore.setItemAsync(
      TOKEN_KEY,
      token
    );
  } else {
    await SecureStore.deleteItemAsync(
      TOKEN_KEY
    );
  }
}

export async function getStoredToken() {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(
      TOKEN_KEY
    );
  }

  return SecureStore.getItemAsync(
    TOKEN_KEY
  );
}

export async function clearStoredToken() {
  await setStoredToken(null);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "L'URL de l'API mobile n'est pas configurée."
    );
  }

  const url = `${API_URL}${path}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    });
  } catch (error) {
    console.error(
      "[API NETWORK ERROR]",
      url,
      error
    );

    throw new Error(
      "Impossible de joindre le serveur. Vérifiez votre connexion Internet et réessayez."
    );
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let body: any = {};

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    body = await response
      .json()
      .catch(() => ({}));
  } else {
    const text = await response
      .text()
      .catch(() => "");

    if (text) {
      body = {
        error: text.slice(0, 300),
      };
    }
  }

  if (!response.ok) {
    console.error(
      "[API ERROR]",
      response.status,
      url,
      body
    );

    throw new Error(
      body?.error ||
        body?.detail ||
        body?.message ||
        `Erreur serveur (${response.status}).`
    );
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

export type AuthResponse = {
  token: string;
  user: MobileUser;
};

export async function login(
  email: string,
  password: string
) {
  const result =
    await request<AuthResponse>(
      "/api/mobile/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

  if (!result?.token) {
    throw new Error(
      "Le serveur n'a pas retourné de jeton de connexion."
    );
  }

  if (!result?.user) {
    throw new Error(
      "Le serveur n'a pas retourné les informations du compte."
    );
  }

  await setStoredToken(
    result.token
  );

  return result.user;
}

export async function register(
  data: {
    prenom: string;
    nom: string;
    email: string;
    password: string;
    codeAccess?: string;
  }
) {
  await request(
    "/api/mobile/auth/register",
    {
      method: "POST",

      body: JSON.stringify(data),
    }
  );

  return login(
    data.email,
    data.password
  );
}

export async function me(
  token: string
) {
  return request<{
    user: MobileUser;
  }>(
    "/api/mobile/auth/me",
    {},
    token
  );
}

export async function changePassword(
  token: string,
  password: string
) {
  return request<{
    success: boolean;
  }>(
    "/api/mobile/auth/change-password",
    {
      method: "POST",

      body: JSON.stringify({
        password,
      }),
    },
    token
  );
}

export async function logout() {
  await clearStoredToken();
}
