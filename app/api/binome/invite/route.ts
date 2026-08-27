import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
      select: { id: true, subscription: true, campaignId: true, campaign: { select: { offer: true, status: true } } }
    });

    if (!receiver) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (receiver.id === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas vous inviter vous-même" }, { status: 400 });
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
        return NextResponse.json({ error: "Les utilisateurs B2B2C ne peuvent faire de binôme qu'avec les membres de leur propre campagne" }, { status: 403 });
      }
    }

    // Check existing pair
    const existing = await prisma.relationalPair.findFirst({
      where: {
        OR: [
          { initiatorId: session.user.id, receiverId: receiver.id },
          { initiatorId: receiver.id, receiverId: session.user.id }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Un binôme ou une invitation existe déjà avec cet utilisateur" }, { status: 400 });
    }

    const pair = await prisma.relationalPair.create({
      data: {
        initiatorId: session.user.id,
        receiverId: receiver.id,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, pair });
  } catch (error: any) {
    console.error("[BINOME_INVITE_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
