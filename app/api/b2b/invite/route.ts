/**
 * app/api/b2b/invite/route.ts — Génération lien et QR Code d'invitation
 * ─────────────────────────────────────────────────────────────────────
 * GET : Retourne le lien d'invitation + le QR code (base64) pour l'organisation
 * de l'utilisateur connecté (doit être ADMIN_B2B, ADMIN_B2B2C ou SUPER_ADMIN).
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";

const ADMIN_ROLES = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"];

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Réservé aux administrateurs d'organisation." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  if (!user?.organizationId) {
    return NextResponse.json(
      { error: "Aucune organisation associée à votre compte." },
      { status: 404 }
    );
  }

  let inviteCode = "";
  let organizationName = "";

  if (campaignId) {
    // Cas B2B2C ou B2B spécifique : Le lien doit lier à une campagne précise
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { organization: true },
    });

    if (!campaign || campaign.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Campagne introuvable ou non autorisée." }, { status: 404 });
    }
    inviteCode = campaign.id;
    organizationName = campaign.organization.name;
  } else {
    // Cas fallback : B2B générique lié à l'organisation globale
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { codeAccess: true, name: true },
    });
    if (!org) {
      return NextResponse.json({ error: "Organisation introuvable." }, { status: 404 });
    }
    inviteCode = org.codeAccess;
    organizationName = org.name;
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://link-office.fr";
  const inviteUrl = `${baseUrl}/join/${inviteCode}`;

  // Générer le QR code en Data URL (PNG base64) pour affichage direct
  const qrCodeDataUrl = await QRCode.toDataURL(inviteUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: "#1a0533",
      light: "#f8fafc",
    },
  });

  return NextResponse.json({
    organizationName,
    codeAccess: inviteCode,
    inviteUrl,
    qrCode: qrCodeDataUrl,
  });
}
