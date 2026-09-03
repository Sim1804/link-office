import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Rôles autorisés à utiliser le Binôme Relationnel
const BINOME_ALLOWED_ROLES = ["EMPLOYEE", "SUPER_ADMIN"];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // [BUG FIX] Bloquer les rôles MEMBER et CITIZEN — spec §11 : Binôme ❌ pour ces rôles
    if (!BINOME_ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Le Binôme Relationnel est réservé aux comptes individuels (EMPLOYEE_PRO). Les adhérents mutuelle et citoyens n'ont pas accès à cette fonctionnalité." },
        { status: 403 }
      );
    }

    const { email, receiverId } = await req.json();
    if (!email && !receiverId) {
      return NextResponse.json({ error: "Email ou ID requis" }, { status: 400 });
    }

    const initiatorUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscription: true, campaignId: true, campaign: { select: { offer: true, status: true } } }
    });

    const receiver = await prisma.user.findUnique({
      where: receiverId ? { id: receiverId } : { email },
      select: { id: true, role: true, subscription: true, campaignId: true, campaign: { select: { offer: true, status: true } } }
    });

    if (!receiver) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (receiver.id === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas vous inviter vous-même" }, { status: 400 });
    }

    // [BUG FIX] Vérifier aussi le rôle du receveur
    if (!BINOME_ALLOWED_ROLES.includes(receiver.role)) {
      return NextResponse.json(
        { error: "Le destinataire ne peut pas rejoindre un Binôme (rôle incompatible)" },
        { status: 403 }
      );
    }

    // Verification des accès Premium+ pour l'initiateur
    const initIsPPlus = initiatorUser?.campaign
      ? (initiatorUser.campaign.offer === "PREMIUM_PLUS" && initiatorUser.campaign.status === "ACTIVE")
      : (initiatorUser?.subscription === "PREMIUM_PLUS");

    // Verification des accès Premium+ pour le receveur
    const recIsPPlus = receiver?.campaign
      ? (receiver.campaign.offer === "PREMIUM_PLUS" && receiver.campaign.status === "ACTIVE")
      : (receiver?.subscription === "PREMIUM_PLUS");

    if (!initIsPPlus || !recIsPPlus) {
      return NextResponse.json({ error: "Les deux utilisateurs doivent disposer de l'offre Premium+" }, { status: 403 });
    }

    // Regle B2B2C: Si l'un est dans une campagne, ils doivent être dans la même
    if (initiatorUser?.campaignId || receiver?.campaignId) {
      if (initiatorUser?.campaignId !== receiver?.campaignId) {
        return NextResponse.json({ error: "Les utilisateurs d'une campagne ne peuvent faire de binôme qu'avec les membres de leur propre campagne" }, { status: 403 });
      }
    }

    // [BUG FIX] Ignorer les paires REJECTED pour permettre une ré-invitation
    const existing = await prisma.relationalPair.findFirst({
      where: {
        OR: [
          { initiatorId: session.user.id, receiverId: receiver.id },
          { initiatorId: receiver.id, receiverId: session.user.id }
        ],
        NOT: { status: "REFUSEE" }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Un binôme ou une invitation est déjà en cours avec cet utilisateur" }, { status: 400 });
    }

    // Supprimer l'ancienne paire REJECTED si elle existe avant d'en créer une nouvelle
    await prisma.relationalPair.deleteMany({
      where: {
        OR: [
          { initiatorId: session.user.id, receiverId: receiver.id, status: "REFUSEE" },
          { initiatorId: receiver.id, receiverId: session.user.id, status: "REFUSEE" }
        ]
      }
    });

    const pair = await prisma.relationalPair.create({
      data: {
        initiatorId: session.user.id,
        receiverId: receiver.id,
        status: "PROPOSITION_ENVOYEE"
      }
    });

    return NextResponse.json({ success: true, pair });
  } catch (error: any) {
    console.error("[BINOME_INVITE_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
