import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText, tool } from "ai";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { buildIrisContext } from "@/lib/iris/context-builder";
import { GamificationService } from "@/lib/gamification/gamification-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour parler à IRIS." },
        { status: 401 }
      );
    }

    await params; // consume params
    const userId = session.user.id;

    const body = await request.json();
    const messageUser = body.message_user as string | undefined;
    const history = (body.history as ModelMessage[]) ?? [];

    if (!messageUser?.trim()) {
      return NextResponse.json({ error: "message_user manquant" }, { status: 400 });
    }

    // Construire le contexte IRIS personnalisé
    const fullUserContext = await buildIrisContext(userId);

    const systemPrompt = [
      "Tu es Iris, l'intelligence artificielle bienveillante et coach de Link-Office.",
      fullUserContext
        ? `\n\n${fullUserContext}\n\nUtilise ces informations de manière subtile, empathique et personnalisée pour éclairer et conseiller l'utilisateur.`
        : "",
      "\n\nTes réponses doivent être très concises (2-3 phrases maximum), chaleureuses, empathiques et en français. N'utilise pas de jargon. Pose parfois une question ouverte pour l'encourager à s'exprimer.",
      "\n\nRÔLE DE COACH POUR LES MICRO-DÉFIS : L'Ordonnance Relationnelle contient des [MICRO_CHALLENGE]. Si pertinent, encourage l'utilisateur à les réaliser, demande-lui s'il a rencontré des difficultés pour un défi, ou félicite-le s'il l'a accompli. Reste naturel et n'en parle pas à chaque message, seulement quand c'est opportun ou si l'utilisateur demande de l'aide sur un défi.",
      "\n\nIMPORTANT: Si l'utilisateur confirme de manière explicite avoir accompli un micro-défi, tu DOIS appeler l'outil `complete_micro_challenge`. RÈGLE ABSOLUE : N'explique jamais à l'utilisateur que tu vas utiliser un outil, et ne mentionne JAMAIS les identifiants techniques (ID) dans ton texte. Contente-toi de féliciter chaleureusement l'utilisateur naturellement pendant que l'outil fait le travail en arrière-plan.",
    ].join("");

    const chatMessages: ModelMessage[] = [
      ...history,
      { role: "user", content: messageUser },
    ];

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: chatMessages,
      toolChoice: "auto",
      tools: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        complete_micro_challenge: tool({
          description:
            "Valider un micro-défi (MICRO_CHALLENGE) lorsque l'utilisateur indique l'avoir accompli.",
          parameters: z.object({
            challengeId: z
              .string()
              .describe("L'identifiant (ID) du défi à valider."),
          }),
          // @ts-expect-error — zodSchema overload mismatch in ai@7.x; runtime is correct
          execute: async ({ challengeId }: { challengeId: string }) => {
            try {
              await GamificationService.completeChallenge(userId, challengeId);
              return { success: true };
            } catch (error: unknown) {
              return {
                success: false,
                error: error instanceof Error ? error.message : "Erreur inconnue",
              };
            }
          },
        }),
      },
    });

    // Extraire le texte final — si le modèle a terminé sur un tool call,
    // on construit un message de félicitation de secours.
    const rawText = result.text;
    const finalMessage = rawText
      ? rawText
          .replace(/<function\b[^>]*>(.*?)<\/function>/gi, "")
          .replace(/<tool_call\b[^>]*>(.*?)<\/tool_call>/gi, "")
          .trim()
      : "Bravo ! Je viens de valider ton défi. Continue comme ça, tu progresses vraiment bien ! 🎉";

    return NextResponse.json({ message_iris: finalMessage });
  } catch (error) {
    console.error("Erreur sendIrisMessage:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
