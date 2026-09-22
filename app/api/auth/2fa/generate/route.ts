import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ detail: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ detail: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Génère un nouveau secret si l'utilisateur n'en a pas, sinon utilise l'existant
    const secret = user.twoFactorSecret || authenticator.generateSecret();

    if (!user.twoFactorSecret) {
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret },
      });
    }

    const otpauthUrl = authenticator.keyuri(user.email, "LinkOffice", secret);

    return NextResponse.json({
      secret,
      otpauthUrl,
    });
  } catch (error) {
    console.error("[2FA_GENERATE_ERROR]:", error);
    return NextResponse.json({ detail: "Erreur serveur" }, { status: 500 });
  }
}
