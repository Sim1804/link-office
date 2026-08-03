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

  const org = await prisma.organization.findUnique({
    where: { codeAccess: code },
    select: {
      name: true,
      type: true,
      logoUrl: true,
    },
  });

  if (!org) {
    return NextResponse.json({ error: "Code invalide." }, { status: 404 });
  }

  return NextResponse.json(org);
}
