import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { matchingOptIn } = await req.json();

    // GUARD: L opt-in matching Binome est reserve aux campagnes PREMIUM+
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { campaignId: true },
    });

    if (currentUser?.campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: currentUser.campaignId },
        select: { offer: true, status: true },
      });
      if (!campaign || campaign.offer !== "PREMIUM_PLUS") {
        return NextResponse.json({
          error: "Le module Binome est reserve aux campagnes PREMIUM+.",
          code: "PREMIUM_PLUS_REQUIRED",
        }, { status: 403 });
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { matchingOptIn: !!matchingOptIn },
      select: { matchingOptIn: true }
    });

    return NextResponse.json({ success: true, matchingOptIn: user.matchingOptIn });
  } catch (error: any) {
    console.error("[BINOME_SETTINGS_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
