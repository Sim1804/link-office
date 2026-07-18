import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "user_id manquant" }, { status: 400 });
    }

    // Sécurité: Vérifier que l'utilisateur est authentifié
    if (!session?.user?.id && userId !== "demo-user") {
      return NextResponse.json({ error: "Non autorisé. Vous devez être connecté." }, { status: 401 });
    }
    // Sécurité: Empêcher de lire les résultats d'un autre utilisateur
    if (session?.user?.id && userId !== session.user.id && userId !== "demo-user") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const assessment = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { result: true },
    });

    let contextScore = "L'utilisateur n'a pas encore de résultats enregistrés.";
    if (assessment?.result) {
      contextScore = `Le score global IQRH est de ${assessment.result.globalScore}/100.
Dimension la plus forte : ${assessment.result.bestDimension}.
Dimension prioritaire (à améliorer) : ${assessment.result.priorityDimension}.`;
    }

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Tu es Iris, la coach bienveillante de Link-Office. Ton rôle est de fournir une explication détaillée mais très accessible, humaine et positive des résultats de l'évaluation IQRH (Intelligence Relationnelle et Introspective).",
      prompt: `Voici le contexte de l'utilisateur :\n${contextScore}\nFais un bilan personnalisé et chaleureux d'environ 2 ou 3 paragraphes pour l'aider à comprendre ce que ça signifie.`,
    });

    return NextResponse.json({ explication: text });
  } catch (error) {
    console.error("Erreur getIrisExplication:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
