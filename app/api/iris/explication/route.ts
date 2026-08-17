/**
 * @file route.ts
 * @module app/api/iris/explication
 * @description Route API pour générer une explication personnalisée des résultats IQRH par IRIS.
 *
 * Cette route est utilisée dans le tableau de bord personnel pour générer une
 * restitution narrative et chaleureuse du bilan IQRH de l'utilisateur.
 * Contrairement aux messages de conversation, c'est une génération one-shot :
 * pas d'historique, pas d'aller-retour — juste une explication contextuelle.
 *
 * Flux :
 * 1. Authentification de l'utilisateur
 * 2. Construction du contexte IQRH complet via `buildIrisContext`
 * 3. Appel Groq avec un prompt spécifique pour la restitution (3 paragraphes)
 * 4. Retour du texte d'explication
 *
 * @method GET
 * @returns {{ explication: string }} — Texte de restitution personnalisée d'environ 3 paragraphes
 * @throws {401} Si l'utilisateur n'est pas authentifié
 * @throws {500} En cas d'erreur Groq ou BDD
 *
 * @see lib/iris/context-builder.ts — Construction du contexte IQRH injecté dans le prompt
 */

import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { buildIrisContext } from "@/lib/iris/context-builder";

/**
 * Génère une explication narrative personnalisée du bilan IQRH par IRIS.
 * Affiché dans le dashboard utilisateur comme "Analyse personnalisée d'IRIS".
 *
 * @param request - La requête HTTP GET (non utilisée dans la logique, requise par Next.js)
 */
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

    // Construction du contexte complet du bilan IQRH pour le prompt
    const userIqrhContext = await buildIrisContext(userId);

    // Appel au LLM pour générer la restitution narrative
    const { text: explanationText } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system:
        "Tu es IRIS, la coach bienveillante et experte de Link-Office. Ton rôle est de fournir un commentaire et une explication personnalisée, humaine, positive et nuancée des résultats complets de l'évaluation IQRH (Météo relationnelle, statuts des dimensions, profil relationnel et ordonnance).\n" +
        "- ADAPTE TON TON : Utilise le vouvoiement pour créer une proximité chaleureuse mais professionnelle.\n" +
        "- PERSONNALISE : Prends impérativement en compte l'âge, la situation et la profession de la personne (ex: sois différente avec un manager de 50 ans ou une étudiante de 20 ans).\n" +
        "- LANGAGE NATUREL : Rédige dans un français parfait. Ne réutilise jamais de mots en anglais ou de termes techniques (comme 'proposeSeveral', 'PROPOSED') qui pourraient figurer dans le contexte.\n" +
        "- SOIS ENCOURAGEANTE : Mets en valeur ses forces avant de parler de ses points d'attention.",
      prompt: `Voici le contexte complet du bilan de l'utilisateur, incluant sa démographie :\n${userIqrhContext}\n\nFais une restitution personnalisée et chaleureuse d'environ 3 paragraphes pour l'aider à interpréter ses résultats, sa météo relationnelle et l'encourager à réaliser les actions prioritaires de son ordonnance. N'utilise jamais de vocabulaire technique.`,
    });

    return NextResponse.json({ explication: explanationText });

  } catch (error) {
    console.error("[IRIS_EXPLICATION_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
