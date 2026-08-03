/**
 * middleware.ts — Protection des routes Next.js (Edge-compatible)
 * ─────────────────────────────────────────────────────────────────
 * N'importe PAS `auth` de NextAuth (qui charge Prisma + bcrypt — incompatibles Edge).
 * Utilise `getToken` de `next-auth/jwt` pour décoder le JWT directement,
 * sans toucher à la base de données.
 *
 * Toutes les routes sous /dashboard, /iris, /binome, /questionnaire,
 * /profil, /adaptive, /resultats, /mon-profil, /consentement
 * nécessitent une session authentifiée.
 *
 * Les dashboards B2B/B2B2C/Collectivités vérifient aussi le rôle.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** Routes nécessitant uniquement une session */
const PROTECTED_PATHS = [
  "/dashboard",
  "/iris",
  "/binome",
  "/questionnaire",
  "/profil",
  "/adaptive",
  "/resultats",
  "/mon-profil",
  "/consentement",
  "/admin",
];

/** Rôles autorisés par route B2B */
const ROLE_RESTRICTED: Record<string, string[]> = {
  "/dashboard/b2b": ["ADMIN_B2B", "SUPER_ADMIN"],
  "/dashboard/b2b2c": ["ADMIN_B2B2C", "SUPER_ADMIN"],
  "/dashboard/collectivites": ["ADMIN_COLLECTIVITE", "SUPER_ADMIN"],
  "/admin": ["SUPER_ADMIN"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "my-super-secret-auth-key-1234";

  // ── Restriction IP pour /admin en production ───────────────────
  if (pathname.startsWith("/admin") && process.env.NODE_ENV === "production") {
    const allowedIPs = (process.env.ADMIN_ALLOWED_IPS || "").split(",").map((ip) => ip.trim()).filter(Boolean);
    if (allowedIPs.length > 0) {
      const clientIP = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
      if (!allowedIPs.includes(clientIP)) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }
  }

  // Détection robuste des cookies NextAuth v5 (authjs.session-token OU next-auth.session-token)
  let token = await getToken({
    req,
    secret,
    cookieName: req.cookies.has("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : req.cookies.has("authjs.session-token")
      ? "authjs.session-token"
      : req.cookies.has("__Secure-next-auth.session-token")
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  });

  // Fallback si cookie non trouvé avec le nom explicite
  if (!token) {
    token = await getToken({ req, secret });
  }

  // ── Vérification routes protégées ─────────────────────────────
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isProtected && !token?.userId) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Vérification par rôle ──────────────────────────────────────
  for (const [route, allowedRoles] of Object.entries(ROLE_RESTRICTED)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      const userRole = token?.role as string | undefined;
      if (!userRole || !allowedRoles.includes(userRole)) {
        const fallback = token?.userId ? "/dashboard" : "/auth/login";
        return NextResponse.redirect(new URL(fallback, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, images publiques
     * - /api/auth/* (NextAuth handlers)
     * - /auth/* (pages de login/register)
     * - /join/* (pages d'invitation — accessibles sans auth)
     * - / (landing page)
     * - /politique-confidentialite, /mentions-legales (RGPD publiques)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|public/|api/auth|auth/|join/|politique-confidentialite|mentions-legales|$).*)",
  ],
};
