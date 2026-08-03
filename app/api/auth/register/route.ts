/**
 * app/api/auth/register/route.ts — Inscription utilisateur
 * ─────────────────────────────────────────────────────────
 * Crée un compte utilisateur. Si un `codeAccess` est fourni,
 * rattache automatiquement l'utilisateur à l'organisation correspondante.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

const registerSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis.").max(50),
  nom: z.string().min(1, "Le nom est requis.").max(50),
  email: z.string().email("Adresse email invalide."),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre."),
  codeAccess: z.string().optional(),
});

export async function POST(req: Request) {
  // ── Rate limiting : 10 inscriptions max par IP par heure ──
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!rateLimit(`register:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 })) {
    const retryAfter = getRetryAfterSeconds(`register:${ip}`);
    return NextResponse.json(
      { detail: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfter / 60)} minute(s).` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { detail: parsed.error.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      );
    }

    const { prenom, nom, email, password, codeAccess } = parsed.data;

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { detail: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    // Résoudre le code d'accès organisation si fourni
    let organizationId: string | null = null;
    let userRole: "EMPLOYEE" | "CITIZEN" | "MEMBER" = "EMPLOYEE";

    if (codeAccess) {
      const org = await prisma.organization.findUnique({
        where: { codeAccess },
        select: { id: true, type: true },
      });
      if (org) {
        organizationId = org.id;
        if (org.type === "B2B") userRole = "EMPLOYEE";
        else if (org.type === "B2B2C") userRole = "MEMBER";
        else if (org.type === "COLLECTIVITE") userRole = "CITIZEN";
      }
    }

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
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { detail: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
