import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { buildIrisContext } from "@/lib/iris/context-builder";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à IRIS." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const contextText = await buildIrisContext(userId);

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system:
        "Tu es Iris, la coach bienveillante et experte de Link-Office. Ton rôle est de fournir un commentaire et une explication personnalisée, humaine, positive et nuancée des résultats complets de l'évaluation IQRH (Météo relationnelle, statuts des dimensions, profil relationnel et ordonnance).",
      prompt: `Voici le contexte complet du bilan de l'utilisateur :\n${contextText}\n\nFais une restitution personnalisée et chaleureuse d'environ 3 paragraphes pour l'aider à interpréter ses résultats, sa météo relationnelle et les actions prioritaires de son ordonnance.`,
    });

    return NextResponse.json({ explication: text });
  } catch (error) {
    console.error("Erreur getIrisExplication:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
