/**
 * app/api/b2b/organization/by-code/[code]/route.ts
 * Retourne les infos publiques d'une organisation par son codeAccess.
 * Utilisé par la page /join/[codeAccess] pour afficher le branding.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // 1. Try to find an Organization by codeAccess
  const org = await prisma.organization.findUnique({
    where: { codeAccess: code },
    select: {
      name: true,
      type: true,
      logoUrl: true,
    },
  });

  if (org) {
    return NextResponse.json(org);
  }

  // 2. Fallback: try to find a Campaign by ID (for B2B2C)
  const campaign = await prisma.campaign.findUnique({
    where: { id: code },
    include: { organization: true },
  });

  if (campaign) {
    return NextResponse.json({
      name: campaign.organization.name,
      type: campaign.organization.type,
      logoUrl: campaign.organization.logoUrl,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
    });
  }

  return NextResponse.json({ error: "Code invalide." }, { status: 404 });
}
