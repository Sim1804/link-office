/**
 * @file auth-client.ts
 * @module validation/common/auth-client
 * @description Client HTTP authentifié pour les tests de validation réelle.
 * Récupère et met en cache les vrais cookies de session Auth.js via le flux Credentials.
 */

export interface AuthSession {
  email: string;
  cookieHeader: string;
  createdAt: number;
}

const sessionCache = new Map<string, AuthSession>();

export async function getSessionCookie(
  baseUrl: string,
  email: string,
  password = "Password123!"
): Promise<string> {
  const cacheKey = `${baseUrl}|${email}`;
  const cached = sessionCache.get(cacheKey);
  // Cache valide 30 minutes
  if (cached && Date.now() - cached.createdAt < 30 * 60 * 1000) {
    return cached.cookieHeader;
  }

  // 1. Récupération du jeton CSRF et des cookies initiaux
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  if (!csrfRes.ok) {
    throw new Error(`Échec de récupération du token CSRF (${csrfRes.status})`);
  }

  // Support getSetCookie ou get("set-cookie")
  const csrfCookies: string[] =
    typeof (csrfRes.headers as any).getSetCookie === "function"
      ? (csrfRes.headers as any).getSetCookie()
      : csrfRes.headers.get("set-cookie")
      ? [csrfRes.headers.get("set-cookie")!]
      : [];

  const csrfData = (await csrfRes.json()) as { csrfToken: string };

  const formData = new URLSearchParams();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("csrfToken", csrfData.csrfToken);

  try {
    const { PrismaClient } = await import("@prisma/client");
    const { generateSync } = await import("otplib");
    const prisma = new PrismaClient();
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { isTwoFactorEnabled: true, twoFactorSecret: true },
    });
    await prisma.$disconnect();
    if (dbUser?.isTwoFactorEnabled && dbUser.twoFactorSecret) {
      const code = generateSync({ secret: dbUser.twoFactorSecret });
      formData.append("twoFactorCode", code);
    }
  } catch (err) {
    console.warn("2FA resolution warning in auth-client:", err);
  }

  const initialCookiesHeader = csrfCookies.map((c) => c.split(";")[0]).join("; ");

  // 2. Appel de connexion credentials
  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: initialCookiesHeader,
    },
    body: formData.toString(),
    redirect: "manual",
  });

  const loginCookies: string[] =
    typeof (loginRes.headers as any).getSetCookie === "function"
      ? (loginRes.headers as any).getSetCookie()
      : loginRes.headers.get("set-cookie")
      ? [loginRes.headers.get("set-cookie")!]
      : [];

  const allCookies = [...csrfCookies, ...loginCookies];
  const cookieHeader = allCookies.map((c) => c.split(";")[0]).join("; ");

  if (!cookieHeader.includes("session-token")) {
    throw new Error(`Échec d'authentification pour ${email} : cookie de session absent`);
  }

  sessionCache.set(cacheKey, {
    email,
    cookieHeader,
    createdAt: Date.now(),
  });

  return cookieHeader;
}
