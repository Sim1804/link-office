import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json({ error: "user_id manquant" }, { status: 400 });
    }

    // Sécurité: Vérifier que l'utilisateur est authentifié
    if (!session?.user?.id && userId !== "demo-user") {
      return NextResponse.json({ error: "Non autorisé. Vous devez être connecté." }, { status: 401 });
    }
    
    // Sécurité: Empêcher d'ouvrir une conversation pour le compte d'un autre
    if (session?.user?.id && userId !== session.user.id && userId !== "demo-user") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    // Générer un identifiant de conversation simple
    const conversationId = `conv_${Date.now()}_${userId}`;

    return NextResponse.json({ conversation_id: conversationId });
  } catch (error) {
    console.error("Erreur startIrisConversation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
