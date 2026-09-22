import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type"); // "magic-link" ou null (vérification d'email par défaut)

  if (!token) {
    return NextResponse.json({ detail: "Jeton manquant." }, { status: 400 });
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ detail: "Jeton invalide." }, { status: 400 });
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json({ detail: "Jeton expiré." }, { status: 400 });
    }

    // Le jeton est valide. On met à jour l'utilisateur.
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json({ detail: "Utilisateur non trouvé." }, { status: 404 });
    }

    // Vérification de l'email
    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    // Supprimer le token pour qu'il ne soit utilisable qu'une seule fois
    await prisma.verificationToken.delete({
      where: { token },
    });

    if (type === "magic-link") {
      // Pour le Magic Link, idéalement on devrait authentifier l'utilisateur.
      // Avec NextAuth v5, cela nécessite souvent un Custom Credentials ou un redirect vers une API d'auth spéciale.
      // Pour l'instant, on redirige vers le login avec un message de succès.
      return NextResponse.redirect(new URL("/auth/login?verified=true&magic=true", request.url));
    }

    return NextResponse.redirect(new URL("/auth/login?verified=true", request.url));
  } catch (error) {
    console.error("[AUTH_VERIFY_ERROR]:", error);
    return NextResponse.json({ detail: "Erreur interne du serveur." }, { status: 500 });
  }
}
