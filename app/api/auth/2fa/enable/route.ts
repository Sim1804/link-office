import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const enable2FASchema = z.object({
  code: z.string().length(6, "Le code doit contenir 6 chiffres."),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ detail: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const result = enable2FASchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ detail: result.error.issues[0].message }, { status: 400 });
    }

    const { code } = result.data;
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ detail: "Configuration 2FA introuvable." }, { status: 400 });
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json({ detail: "Code invalide." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[2FA_ENABLE_ERROR]:", error);
    return NextResponse.json({ detail: "Erreur serveur" }, { status: 500 });
  }
}
