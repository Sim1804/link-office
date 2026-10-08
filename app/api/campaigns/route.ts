/**
 * app/api/campaigns/route.ts
 * GET  — Liste les campagnes de l organisation
 * POST — Cree une nouvelle campagne (ADMIN_B2B / SUPER_ADMIN uniquement)
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GET_ALLOWED_ROLES = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"];
const POST_ALLOWED_ROLES = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"];

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!GET_ALLOWED_ROLES.includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const requestedOrgId = searchParams.get("organizationId") || searchParams.get("orgId");
    const requestedType = searchParams.get("type") || searchParams.get("portalType");

    if (user.role === "SUPER_ADMIN") {
      const whereClause: any = {};
      if (requestedOrgId) {
        whereClause.organizationId = requestedOrgId;
      } else if (requestedType) {
        whereClause.organization = { type: requestedType };
      }

      const campaigns = await prisma.campaign.findMany({
        where: whereClause,
        orderBy: { startDate: "desc" },
        include: {
          organization: { select: { id: true, name: true, type: true } },
          _count: { select: { assessments: true, users: true, invites: true } },
          snapshot: { select: { createdAt: true } },
        },
      });
      return NextResponse.json({ campaigns });
    }

    if (!user.organizationId) return NextResponse.json({ error: "Aucune organisation associee" }, { status: 400 });

    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { startDate: "desc" },
      include: {
        organization: { select: { id: true, name: true, type: true } },
        _count: { select: { assessments: true, users: true, invites: true } },
        snapshot: { select: { createdAt: true } },
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("GET /api/campaigns:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!POST_ALLOWED_ROLES.includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    const data = await request.json();
    
    // Résolution de l'organisation :
    // - Si SUPER_ADMIN : priorité à data.organizationId pour cibler n'importe quel partenaire
    // - Si Admin d'organisation : restreint strictement à son propre user.organizationId
    let orgId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      if (data.organizationId) {
        orgId = data.organizationId;
      } else if (user.organizationId) {
        orgId = user.organizationId;
      } else {
        const defaultOrg = await prisma.organization.findFirst();
        if (defaultOrg) orgId = defaultOrg.id;
      }
    } else {
      orgId = user.organizationId || null;
    }

    if (!orgId) {
      return NextResponse.json({ error: "Aucune organisation disponible pour lier cette campagne." }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return NextResponse.json({ error: "Organisation cible introuvable." }, { status: 404 });
    }

    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Champs manquants: title, startDate, endDate" }, { status: 400 });
    }

    const offer = data.offer ?? "PREMIUM";
    if (!["PREMIUM", "PREMIUM_PLUS"].includes(offer)) {
      return NextResponse.json({ error: "Offre invalide. Choisissez PREMIUM ou PREMIUM_PLUS." }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetPopulation: data.targetPopulation ? parseInt(data.targetPopulation) : null,
        quota: data.quota ? parseInt(data.quota) : null,
        territory: data.territory ?? null,
        logoUrl: data.logoUrl ?? null,
        offer,
        status: data.status ?? "DRAFT",
        organizationId: orgId,
        parentCampaignId: data.parentCampaignId ?? null,
        questionnaireConfig: data.questionnaireConfig ?? { hiddenDemographics: [], allowedSituations: null },
      },
    });

    // Création transactionnelle des variables si transmises directement
    if (data.variables && Array.isArray(data.variables) && data.variables.length > 0) {
      for (const v of data.variables) {
        if (!v.question) continue;
        const varId = `${campaign.id}_${v.id || Math.random().toString(36).substring(2, 9)}`;
        await prisma.campaignVariable.create({
          data: {
            id: varId,
            campaignId: campaign.id,
            question: v.question,
            options: v.options || [],
            required: v.required || false,
          },
        });
      }
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/campaigns:", error);
    return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
  }
}
