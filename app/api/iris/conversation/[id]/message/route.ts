import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: conversationId } = await params;
    
    // Extract userId from conversationId (conv_12345_userId)
    const userId = conversationId.split("_").slice(2).join("_");

    const body = await request.json();
    const messageUser = body.message_user;
    const history = body.history || [];

    if (!messageUser) {
      return NextResponse.json({ error: "message_user manquant" }, { status: 400 });
    }

    // Sécurité
    if (!session?.user?.id && userId !== "demo-user") {
      return NextResponse.json({ error: "Non autorisé. Vous devez être connecté." }, { status: 401 });
    }
    if (session?.user?.id && userId !== session.user.id && userId !== "demo-user") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    // Prepare system context
    let contextText = "Tu es Iris, l'intelligence artificielle bienveillante et coach de Link-Office.";
    
    if (userId) {
      const assessment = await prisma.assessment.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: { result: true },
      });

      if (assessment?.result) {
        contextText += `\nL'utilisateur a un score IQRH de ${assessment.result.globalScore}/100.
Sa dimension prioritaire (à travailler) est : ${assessment.result.priorityDimension}.
Sa dimension la plus forte est : ${assessment.result.bestDimension}.
Utilise ces informations subtilement pour personnaliser tes conseils.`;
      }
    }

    contextText += "\nTes réponses doivent être très concises (2-3 phrases maximum), chaleureuses, empathiques et en français. N'utilise pas de jargon. Pose parfois une question ouverte pour l'encourager à s'exprimer.";

    const chatMessages = [
      ...history,
      { role: "user", content: messageUser }
    ];

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: contextText,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: chatMessages as any,
    });

    return NextResponse.json({ message_iris: text });
  } catch (error) {
    console.error("Erreur sendIrisMessage:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
