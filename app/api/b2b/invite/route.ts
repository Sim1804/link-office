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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Réservé aux administrateurs d'organisation." },
      { status: 403 }
    );
  }

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

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { codeAccess: true, name: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Organisation introuvable." }, { status: 404 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://link-office.fr";
  const inviteUrl = `${baseUrl}/join/${org.codeAccess}`;

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
    organizationName: org.name,
    codeAccess: org.codeAccess,
    inviteUrl,
    qrCode: qrCodeDataUrl,
  });
}
