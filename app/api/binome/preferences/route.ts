import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BINOME_ALLOWED_ROLES = ["EMPLOYEE", "SUPER_ADMIN"];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!BINOME_ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Le Binôme Relationnel est réservé aux comptes individuels Premium/Premium+.", code: "ROLE_NOT_ALLOWED" },
        { status: 403 }
      );
    }

    const preferences = await prisma.binomePreference.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ success: true, preferences });
  } catch (error: any) {
    console.error("[BINOME_PREF_GET_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!BINOME_ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Le Binôme Relationnel est réservé aux comptes individuels Premium/Premium+.", code: "ROLE_NOT_ALLOWED" },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Verification Premium+
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { campaignId: true, subscription: true },
    });

    if (currentUser?.campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: currentUser.campaignId },
        select: { offer: true, status: true },
      });
      if (!campaign || (campaign.offer !== "PREMIUM_PLUS" && campaign.offer !== "PREMIUM") || campaign.status !== "ACTIVE") {
        return NextResponse.json({
          error: "Le module Binôme est réservé aux campagnes PREMIUM ou PREMIUM+ actives.",
          code: "PREMIUM_PLUS_REQUIRED",
        }, { status: 403 });
      }
    } else if (currentUser?.subscription !== "PREMIUM_PLUS" && currentUser?.subscription !== "PREMIUM") {
       return NextResponse.json({
          error: "Le module Binôme est réservé aux abonnements PREMIUM ou PREMIUM+.",
          code: "PREMIUM_PLUS_REQUIRED",
        }, { status: 403 });
    }

    const preferences = await prisma.binomePreference.upsert({
      where: { userId: session.user.id },
      update: {
        optIn: data.optIn ?? true,
        availability: data.availability || [],
        communicationMode: data.communicationMode || [],
        preferredFrequency: data.preferredFrequency || "",
        agePreference: data.agePreference || "",
        genderPreference: data.genderPreference || "",
        geographicalPreference: data.geographicalPreference || "",
        expectations: data.expectations || [],
        charterVersion: data.charterVersion || "1.0",
        consentDate: new Date()
      },
      create: {
        userId: session.user.id,
        optIn: data.optIn ?? true,
        availability: data.availability || [],
        communicationMode: data.communicationMode || [],
        preferredFrequency: data.preferredFrequency || "",
        agePreference: data.agePreference || "",
        genderPreference: data.genderPreference || "",
        geographicalPreference: data.geographicalPreference || "",
        expectations: data.expectations || [],
        charterVersion: data.charterVersion || "1.0",
        consentDate: new Date()
      }
    });

    // We also update the user's matchingOptIn just in case legacy code relies on it
    await prisma.user.update({
      where: { id: session.user.id },
      data: { matchingOptIn: preferences.optIn }
    });

    return NextResponse.json({ success: true, preferences });
  } catch (error: any) {
    console.error("[BINOME_PREF_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
