import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour démarrer une conversation IRIS." },
        { status: 401 }
      );
    }

    const conversationId = `conv_${Date.now()}_${randomUUID()}`;
    return NextResponse.json({ conversation_id: conversationId });
  } catch (error) {
    console.error("Erreur startIrisConversation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
