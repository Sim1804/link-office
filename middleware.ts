/**
 * @file middleware.ts
 * @module (racine)
 * @description Middleware Next.js Edge — Protection des routes et contrôle d'accès (RBAC).
 *
 * Ce middleware s'exécute à la périphérie (Edge Runtime) avant chaque requête.
 * Il protège les routes de l'application en vérifiant :
 * 1. L'authentification (présence d'un JWT valide)
 * 2. Le rôle de l'utilisateur (pour les dashboards admin)
 * 3. L'IP d'origine pour la Console Admin en production
 *
 * CONTRAINTE TECHNIQUE IMPORTANTE :
 * Ce fichier N'IMPORTE PAS `auth` depuis NextAuth car `auth` charge Prisma et bcrypt,
 * qui sont incompatibles avec l'Edge Runtime de Next.js.
 * On utilise à la place `getToken` de `next-auth/jwt` qui décode le JWT directement
 * depuis les cookies, sans accès à la base de données.
 *
 * ROUTES PROTÉGÉES (session requise) :
 * /dashboard, /iris, /binome, /questionnaire, /profil, /adaptive,
 * /resultats, /mon-profil, /consentement, /admin
 *
 * ROUTES RESTREINTES PAR RÔLE :
 * - /dashboard/b2b         → ADMIN_B2B, SUPER_ADMIN
 * - /dashboard/b2b2c       → ADMIN_B2B2C, SUPER_ADMIN
 * - /dashboard/collectivites → ADMIN_COLLECTIVITE, SUPER_ADMIN
 * - /admin                 → SUPER_ADMIN (+ restriction IP en production)
 *
 * ROUTES PUBLIQUES (excluées du matcher) :
 * Landing (/), auth, api/auth, mentions légales, politique de confidentialité, invitations
 *
 * @see lib/auth.ts — Configuration NextAuth (accès BDD, sessions)
 * @see next.config.ts — Configuration Next.js complémentaire
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Routes nécessitant uniquement une session active.
 * Toute sous-route de ces chemins est également protégée.
 */
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

/**
 * Mapping route → rôles autorisés pour le contrôle d'accès basé sur les rôles (RBAC).
 * Les utilisateurs sans le rôle requis sont redirigés vers /dashboard ou /auth/login.
 */
const ROLE_RESTRICTED_ROUTES: Record<string, string[]> = {
  "/dashboard/b2b": ["ADMIN_B2B", "SUPER_ADMIN"],
  "/dashboard/b2b2c": ["ADMIN_B2B2C", "SUPER_ADMIN"],
  "/dashboard/collectivites": ["ADMIN_COLLECTIVITE", "SUPER_ADMIN"],
  "/admin": ["SUPER_ADMIN"],
};

/**
 * Middleware principal de protection des routes.
 * Exécuté sur chaque requête correspondant au `matcher` défini dans `config`.
 *
 * @param request - La requête HTTP entrante (NextRequest avec accès aux cookies)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Clé secrète JWT — doit correspondre à celle utilisée par NextAuth
  const jwtSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "my-super-secret-auth-key-1234";

  // ── Restriction IP pour /admin en production ─────────────────────────────
  // Les IPs autorisées sont configurées via la variable d'environnement ADMIN_ALLOWED_IPS
  if (pathname.startsWith("/admin") && process.env.NODE_ENV === "production") {
    const allowedIPs = (process.env.ADMIN_ALLOWED_IPS || "")
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);
    if (allowedIPs.length > 0) {
      const clientIP =
        (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "";
      if (!allowedIPs.includes(clientIP)) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }
  }

  // ── Lecture du JWT depuis les cookies ────────────────────────────────────
  // NextAuth v5 (Auth.js) utilise des noms de cookies différents selon l'environnement.
  // On essaie dans l'ordre les variantes connues pour maximiser la compatibilité.
  let jwtToken = await getToken({
    req: request,
    secret: jwtSecret,
    cookieName: request.cookies.has("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : request.cookies.has("authjs.session-token")
      ? "authjs.session-token"
      : request.cookies.has("__Secure-next-auth.session-token")
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  });

  // Fallback avec la détection automatique du cookie si la première tentative échoue
  if (!jwtToken) {
    jwtToken = await getToken({ req: request, secret: jwtSecret });
  }

  // ── Vérification d'authentification ─────────────────────────────────────
  const isProtectedPath = PROTECTED_PATHS.some(
    (protectedPath) => pathname === protectedPath || pathname.startsWith(`${protectedPath}/`)
  );

  if (isProtectedPath && !jwtToken?.userId) {
    // Redirection vers login avec callback pour revenir après connexion
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Vérification du changement de mot de passe obligatoire ──────────────
  if (isProtectedPath && jwtToken?.mustChangePassword && pathname !== "/auth/change-password") {
    return NextResponse.redirect(new URL("/auth/change-password", request.url));
  }

  // ── Vérification du rôle (RBAC) ─────────────────────────────────────────
  for (const [restrictedRoute, allowedRoles] of Object.entries(ROLE_RESTRICTED_ROUTES)) {
    if (pathname === restrictedRoute || pathname.startsWith(`${restrictedRoute}/`)) {
      const userRole = jwtToken?.role as string | undefined;
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Connecté mais mauvais rôle → dashboard, sinon login
        const redirectTarget = jwtToken?.userId ? "/dashboard" : "/auth/login";
        return NextResponse.redirect(new URL(redirectTarget, request.url));
      }
    }
  }

  // ── Autorisation accordée ────────────────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Applique le middleware à tous les chemins SAUF :
     * - _next/static, _next/image     : Fichiers statiques Next.js
     * - favicon.ico, public/          : Assets publics
     * - /api/auth/*                   : Endpoints NextAuth (login, logout, callback OAuth)
     * - /auth/*                       : Pages de connexion et inscription
     * - /join/*                       : Pages d'invitation (accessibles sans auth)
     * - /                             : Landing page publique
     * - /politique-confidentialite    : Page RGPD publique
     * - /mentions-legales             : Mentions légales publiques
     */
    "/((?!_next/static|_next/image|favicon\\.ico|public/|api/auth|auth/|join/|politique-confidentialite|mentions-legales|$).*)",
  ],
};
