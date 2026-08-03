/**
 * app/api/b2b/organization/route.ts — CRUD Organisations
 * ─────────────────────────────────────────────────────────
 * GET  : Récupérer l'organisation de l'utilisateur connecté
 * POST : Créer une nouvelle organisation (SUPER_ADMIN uniquement)
 * PUT  : Mettre à jour une organisation (ADMIN ou SUPER_ADMIN)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { randomBytes } from "crypto";

const ADMIN_ROLES = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"];

const createOrgSchema = z.object({
  name: z.string().min(2, "Le nom est requis.").max(100),
  type: z.enum(["B2B", "B2B2C", "COLLECTIVITE"]),
  siren: z.string().optional(),
  domainName: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

const updateOrgSchema = createOrgSchema.partial().extend({
  id: z.string().min(1, "L'ID est requis."),
});

/** Générer un code d'accès unique */
function generateCodeAccess(orgName: string, year = new Date().getFullYear()) {
  const slug = orgName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 12)
    .toUpperCase();
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `${slug}-${year}-${suffix}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true, role: true },
  });

  if (!user?.organizationId) {
    return NextResponse.json({ error: "Aucune organisation associée." }, { status: 404 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    include: {
      campaigns: { orderBy: { startDate: "desc" }, take: 10 },
      services: { orderBy: { createdAt: "desc" } },
      _count: { select: { users: true } },
    },
  });

  return NextResponse.json(org);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Réservé aux super-administrateurs." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = createOrgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const { name, type, siren, domainName, logoUrl } = parsed.data;
  const codeAccess = generateCodeAccess(name);

  const org = await prisma.organization.create({
    data: { name, type, siren, domainName, logoUrl: logoUrl || null, codeAccess },
  });

  return NextResponse.json(org, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateOrgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const { id, ...data } = parsed.data;

  // Vérifier que l'admin appartient bien à cette organisation
  if (session.user.role !== "SUPER_ADMIN") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });
    if (user?.organizationId !== id) {
      return NextResponse.json(
        { error: "Vous ne pouvez modifier que votre organisation." },
        { status: 403 }
      );
    }
  }

  const org = await prisma.organization.update({
    where: { id },
    data: { ...data, logoUrl: data.logoUrl || null },
  });

  return NextResponse.json(org);
}
