/**
 * @file route.ts
 * @module app/api/auth/register
 * @description Route API d'inscription d'un nouveau compte utilisateur.
 *
 * Gère la création de compte avec les fonctionnalités suivantes :
 * - Validation des données (Zod) : prénom, nom, email, mot de passe robuste
 * - Rate limiting : 10 tentatives max par IP par heure (protection anti-spam)
 * - Unicité de l'email : retour d'erreur si l'email est déjà enregistré
 * - Attribution automatique d'un rôle et d'une organisation via `codeAccess` :
 *   · Code B2B        → rôle EMPLOYEE
 *   · Code B2B2C      → rôle MEMBER
 *   · Code COLLECTIVITE → rôle CITIZEN
 * - Hashage sécurisé du mot de passe (bcrypt, 12 rounds)
 *
 * @method POST
 * @body {{ prenom, nom, email, password, codeAccess? }}
 * @returns {201} Informations de l'utilisateur créé (sans le mot de passe)
 * @throws {400} Données invalides ou email déjà utilisé
 * @throws {429} Trop de tentatives d'inscription
 * @throws {500} Erreur interne serveur
 *
 * @see app/auth/register/page.tsx — Formulaire qui appelle cette route
 * @see lib/auth.ts — Configuration NextAuth qui lit la BDD créée ici
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

/**
 * Schéma de validation des données d'inscription.
 * Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre.
 */
const registerSchema = z.object({
  /** Prénom de l'utilisateur */
  prenom: z.string().min(1, "Le prénom est requis.").max(50),
  /** Nom de famille */
  nom: z.string().min(1, "Le nom est requis.").max(50),
  /** Email unique — servira d'identifiant de connexion */
  email: z.string().email("Adresse email invalide."),
  /**
   * Mot de passe (minimum 8 caractères, 1 majuscule, 1 chiffre).
   * Sera hashé avec bcrypt (12 rounds) avant la persistance.
   */
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre."),
  /** Code d'accès organisationnel optionnel (rattache à une organisation et attribue un rôle) */
  codeAccess: z.string().optional(),
});

/**
 * Crée un nouveau compte utilisateur avec rate limiting et validation robuste.
 *
 * @param request - Requête HTTP avec le body d'inscription
 */
export async function POST(request: Request) {
  // ── Rate limiting : 10 inscriptions max par IP par heure ──────────────────
  // Extrait l'IP réelle derrière un proxy/load balancer (x-forwarded-for)
  const clientIp = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!rateLimit(`register:${clientIp}`, { limit: 10, windowMs: 60 * 60 * 1000 })) {
    const retryAfterSeconds = getRetryAfterSeconds(`register:${clientIp}`);
    return NextResponse.json(
      { detail: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfterSeconds / 60)} minute(s).` },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  try {
    const requestBody = await request.json();

    // Validation Zod — retourne la première erreur rencontrée
    const parseResult = registerSchema.safeParse(requestBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { detail: parseResult.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const { prenom, nom, email, password, codeAccess } = parseResult.data;

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { detail: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    // ── Résolution du code d'accès organisationnel (optionnel) ──────────────
    // Le code d'accès est distribué par les organisations B2B aux membres de leur équipe.
    // Il détermine l'organisation de rattachement ET le rôle initial dans l'application.
    let organizationId: string | null = null;
    let userRole: "EMPLOYEE" | "CITIZEN" | "MEMBER" = "EMPLOYEE";

    if (codeAccess) {
      // 1. Check if codeAccess is a Campaign ID
      const matchingCampaign = await prisma.campaign.findUnique({
        where: { id: codeAccess },
        include: { organization: true },
      });

      if (matchingCampaign) {
        organizationId = matchingCampaign.organizationId;
        userRole = "EMPLOYEE"; // B2B2C beneficiaries are considered employees
        
        // Link to campaign
        const campaignUpdate = {
          campaignId: matchingCampaign.id,
          subscription: matchingCampaign.offer, // PREMIUM or PREMIUM_PLUS
        };
        
        // Create user with campaign link
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
          data: { firstName: prenom, lastName: nom, email, password: hashedPassword, organizationId, role: userRole, ...campaignUpdate },
          select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true, subscription: true },
        });
        return NextResponse.json({ user_id: user.id, email: user.email, prenom: user.firstName, nom: user.lastName, role: user.role }, { status: 201 });
      }

      // 2. Fallback: Check if codeAccess is an Organization codeAccess
      const matchingOrganization = await prisma.organization.findUnique({
        where: { codeAccess },
        select: { id: true, type: true },
      });
      if (matchingOrganization) {
        organizationId = matchingOrganization.id;
        if (matchingOrganization.type === "B2B") userRole = "EMPLOYEE";
        else if (matchingOrganization.type === "B2B2C") userRole = "MEMBER";
        else if (matchingOrganization.type === "COLLECTIVITE") userRole = "CITIZEN";
      }
    }

    // Hashage sécurisé du mot de passe (12 rounds de salage = bon équilibre sécurité/performance)
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: prenom,
        lastName: nom,
        email,
        password: hashedPassword,
        role: userRole,
        organizationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
      },
    });

    return NextResponse.json(
      {
        user_id: user.id,
        email: user.email,
        prenom: user.firstName,
        nom: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AUTH_REGISTER_ERROR]:", error);
    return NextResponse.json(
      { detail: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
