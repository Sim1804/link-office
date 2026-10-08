import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET /api/campaigns/[id]/variables
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ALLOWED_ROLES = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"];
    if (!ALLOWED_ROLES.includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (campaign.organizationId !== user?.organizationId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const variables = await prisma.campaignVariable.findMany({
      where: { campaignId: id }
    });

    return NextResponse.json({ variables }, { status: 200 });
  } catch (e) {
    console.error("GET /campaigns/[id]/variables:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/campaigns/[id]/variables
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ALLOWED_ROLES = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"];
    if (!ALLOWED_ROLES.includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (campaign.organizationId !== user?.organizationId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const { variables } = await req.json(); // Array of variables: { id?, question, options, required }
    if (!Array.isArray(variables)) {
      return NextResponse.json({ error: "Le paramètre variables doit être une liste" }, { status: 400 });
    }

    // On supprime les anciennes variables qui ne sont plus envoyées
    const existingVariables = await prisma.campaignVariable.findMany({ where: { campaignId: id } });
    const existingIds = existingVariables.map(v => v.id);

    // Identifiants uniques préfixés par la campagne pour éviter les collisions globales
    const preparedVars = variables.map((v: any) => {
      const uniqueId = v.id && v.id.startsWith(`${id}_`)
        ? v.id
        : `${id}_${v.id || crypto.randomUUID()}`;
      return {
        id: uniqueId,
        question: v.question,
        options: v.options || [],
        required: v.required || false,
      };
    });

    const newIds = preparedVars.map(v => v.id);
    const idsToDelete = existingIds.filter(eid => !newIds.includes(eid));

    await prisma.$transaction(async (tx) => {
      if (idsToDelete.length > 0) {
        await tx.campaignVariable.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }

      for (const v of preparedVars) {
        if (existingIds.includes(v.id)) {
          await tx.campaignVariable.update({
            where: { id: v.id },
            data: {
              question: v.question,
              options: v.options,
              required: v.required,
            }
          });
        } else {
          await tx.campaignVariable.create({
            data: {
              id: v.id,
              campaignId: id,
              question: v.question,
              options: v.options,
              required: v.required,
            }
          });
        }
      }
    });

    const updated = await prisma.campaignVariable.findMany({ where: { campaignId: id } });

    return NextResponse.json({ success: true, variables: updated }, { status: 200 });
  } catch (e) {
    console.error("POST /campaigns/[id]/variables:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
