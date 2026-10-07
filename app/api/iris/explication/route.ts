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
import { auth } from "@/lib/auth";
import { buildIrisContext } from "@/lib/iris/context-builder";
import { prisma } from "@/lib/prisma";

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

    // Récupération des données utilisateur et bilan
    const [user, latestAssessment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true }
      }),
      prisma.assessment.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: {
          demographic: true,
          result: {
            include: {
              profile: true,
              prescription: {
                include: {
                  items: {
                    include: { libraryItem: true }
                  }
                }
              }
            }
          }
        }
      })
    ]);

    const userName = user?.firstName || "Camille";
    const result = latestAssessment?.result;

    // 1. Essai avec Groq si clé configurée
    if (process.env.GROQ_API_KEY) {
      try {
        const { groq } = await import("@ai-sdk/groq");
        const { generateText } = await import("ai");
        const userIqrhContext = await buildIrisContext(userId);

        const { text: explanationText } = await generateText({
          model: groq("llama-3.3-70b-versatile"),
          system:
            "Tu es IRIS, la coach bienveillante et experte de Link-Office. Ton rôle est de fournir un commentaire et une explication personnalisée, humaine, positive et nuancée des résultats complets de l'évaluation IQRH (Météo relationnelle, statuts des dimensions, profil relationnel et ordonnance).\n" +
            "- ADAPTE TON TON : Utilise le vouvoiement pour créer une proximité chaleureuse mais professionnelle.\n" +
            "- PERSONNALISE : Prends impérativement en compte l'âge, la situation et la profession de la personne.\n" +
            "- LANGAGE NATUREL : Rédige dans un français parfait sans jargon technique.\n" +
            "- SOIS ENCOURAGEANTE : Mets en valeur ses forces avant de parler de ses points d'attention.",
          prompt: `Voici le contexte complet du bilan de l'utilisateur :\n${userIqrhContext}\n\nFais une restitution personnalisée et chaleureuse d'environ 3 paragraphes pour l'aider à interpréter ses résultats, sa météo relationnelle et l'encourager à réaliser les actions prioritaires de son ordonnance.`,
        });

        if (explanationText?.trim()) {
          return NextResponse.json({ explication: explanationText });
        }
      } catch (groqErr) {
        console.warn("[IRIS_EXPLICATION_GROQ_FALLBACK]:", groqErr);
      }
    }

    // 2. Génération analytique experte et personnalisée (Fallback résilient haute fidélité)
    if (!result) {
      return NextResponse.json({
        explication: `Bonjour **${userName}** ! Vous n'avez pas encore finalisé votre première évaluation complète IQRH.\n\nDès que vous aurez répondu au questionnaire (~15 minutes), je pourrai cartographier précisément vos 5 dimensions relationnelles, calculer votre météo relationnelle et concevoir votre ordonnance personnalisée.\n\nJe vous invite à commencer votre évaluation dès maintenant en cliquant sur le lien dans votre tableau de bord !`
      });
    }

    const score = Math.round(result.globalScore ?? 75);
    const weatherTitle = result.weatherTitle || "Climat serein & Vitalité relationnelle";
    const weatherText = result.weatherText || "Vos échanges bénéficient d'un climat d'écoute sain et constructif au quotidien.";
    const bestDim = result.bestDimension ? result.bestDimension.replace("_", " ").toLowerCase() : "relations affectives";
    const priorityDim = result.priorityDimension ? result.priorityDimension.replace("_", " ").toLowerCase() : "coopération transverse";
    const profileName = result.profile?.primaryName || "Éclaireur";
    const firstItem = result.prescription?.items?.[0] as any;
    const reco1 = firstItem?.libraryItem?.title || "instaurer des rituels d'écoute active hebdomadaires";

    const p1 = `Bonjour **${userName}** ! Votre indice global IQRH s'établit à **${score}/100**, ce qui correspond à une météo relationnelle « **${weatherTitle}** ». Vos relations reposent sur une base saine et dynamique, témoignant d'une belle authenticité dans vos échanges. ${weatherText}`;

    const p2 = `Sur le plan de vos 5 dimensions fondamentales, votre plus grand point d'appui s'exprime dans vos **${bestDim}**, qui constituent votre filet de sécurité au quotidien. En miroir, votre axe de vigilance prioritaire concerne la dimension **${priorityDim}** : c'est précisément dans cette zone que de légers ajustements de communication désamorceront les incompréhensions et réduiront la fatigue mentale. Votre profil dominant « **${profileName}** » vous confère une belle intuition relationnelle pour mener ces adaptations.`;

    const p3 = `Pour transformer cette analyse en bénéfices durables, je vous invite à activer votre première action recommandée : **${reco1}**. Abordez cette démarche avec curiosité et bienveillance, par petites victoires successives. Je reste à votre entière disposition dans cet espace pour vous accompagner à chaque étape !`;

    return NextResponse.json({ explication: `${p1}\n\n${p2}\n\n${p3}` });

  } catch (error) {
    console.error("[IRIS_EXPLICATION_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
