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
import { generateResponse } from "@/lib/iris/llm";

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

    // Récupération des données utilisateur et bilan validé
    // PRIORITÉ 1 : Assessment soumis avec résultat
    // PRIORITÉ 2 : Tout assessment avec résultat calculé
    const [user, latestAssessment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, role: true }
      }),
      prisma.assessment.findFirst({
        where: {
          userId,
          status: "SUBMITTED",
          result: { isNot: null }
        },
        orderBy: { submittedAt: "desc" },
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
      }).then(async (assessment) => {
        if (assessment) return assessment;
        return prisma.assessment.findFirst({
          where: {
            userId,
            result: { isNot: null }
          },
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
        });
      })
    ]);

    const userName = user?.firstName || "Camille";
    const result = latestAssessment?.result;

    // ── Cas Spécial 1 : SUPER_ADMIN (Gouvernance globale & Supervision plateforme) ──
    if (user?.role === "SUPER_ADMIN") {
      return NextResponse.json({
        hasAssessment: false,
        isAdminView: true,
        explication: `Bonjour **Super Admin** ! En tant qu'administrateur global de Link Office, votre espace est dédié au pilotage stratégique et opérationnel de la plateforme.\n\n### Supervision & Cadre Méthodologique de la Plateforme\n\n• **Modèle Scientifique IQRH** : Cartographie relationnelle sur 5 dimensions fondamentales (Sociale, Affective, Sentimentale, Professionnelle et Soi), articulée avec l'Indice d'Équilibre Relationnel (IER) et la Charge Relationnelle (ICR).\n\n• **Confidentialité & k-Anonymat Strict** : Tous les baromètres d'équipe (B2B, B2G, B2B2C) appliquent un **seuil d'anonymisation strict de 5 répondants minimum**. En-deçà de ce seuil, aucune donnée agrégée n'est calculée pour préserver le secret statistique et la liberté d'expression.\n\n• **Gouvernance de l'IA & Sécurité** : Les échanges avec IRIS s'appuient sur notre passerelle multi-modèles avec audit de sécurité en cascade (Couche 1 Regex et Couche 2 sémantique) et traçabilité RGPD intégrale.\n\n> En tant que Super Administrateur, vous supervisez l'écosystème global sans passer d'évaluation personnelle. Je reste à votre entière disposition dans l'onglet **Coach** pour toute question relative aux organisations partenaires, à la configuration des campagnes ou aux métriques globales.`
      });
    }

    // ── Cas Spécial 2 : ADMIN Organisation sans bilan personnel ──────────────────
    const isOrgAdmin = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G", "ADMIN_COLLECTIVITE"].includes(user?.role || "");
    if (isOrgAdmin && !result) {
      return NextResponse.json({
        hasAssessment: false,
        isAdminView: true,
        explication: `Bonjour **${userName}** ! En tant que responsable RH et QVT de votre organisation, votre compte est dédié à l'animation des campagnes et à l'analyse collective du climat relationnel.\n\n### Repères Clés pour votre Organisation\n\n• **Baromètre d'Équipe & k-Anonymat** : Les scores collectifs de vos équipes sont calculés dès 5 répondants pour garantir une totale confidentialité à vos collaborateurs.\n\n• **Indicateurs de Climat Social** : Surveillez en priorité l'Indice d'Équilibre Relationnel (IER) et les écarts entre vos dimensions motrices et vos axes de vigilance managériaux.\n\n• **Passage à l'Action** : Activez vos plans d'actions RH ciblés et encouragez le programme Binôme Relationnel pour désamorcer les silos et renforcer l'entraide.\n\n> Votre profil gestionnaire pilote la dynamique collective. Vous pouvez me solliciter dans l'onglet **Coach** pour interpréter vos résultats d'équipe ou concevoir des initiatives managériales.`
      });
    }

    // 1. Essai avec le module centralisé IRIS LLM
    try {
      const userIqrhContext = await buildIrisContext(userId);
      const llmResult = await generateResponse({
        system:
          "Tu es IRIS, la coach bienveillante et experte de Link-Office. Ton rôle est de fournir un commentaire et une explication personnalisée, humaine, positive et nuancée des résultats complets de l'évaluation IQRH (Météo relationnelle, statuts des dimensions, profil relationnel et ordonnance).\n" +
          "- ADAPTE TON TON : Utilise le vouvoiement pour créer une proximité chaleureuse mais professionnelle.\n" +
          "- PERSONNALISE : Prends impérativement en compte l'âge, la situation et la profession de la personne.\n" +
          "- LANGAGE NATUREL : Rédige dans un français parfait sans jargon technique.\n" +
          "- SOIS ENCOURAGEANTE : Mets en valeur ses forces avant de parler de ses points d'attention.\n" +
          "- 🛑 RÈGLE FONDAMENTALE : L'utilisateur a DÉJÀ complété et validé son évaluation IQRH. Il est STRICTEMENT INTERDIT de lui proposer de passer, repasser ou commencer le questionnaire, et STRICTEMENT INTERDIT de mentionner un lien vers /questionnaire. Tu dois te concentrer à 100% sur l'explication de ses scores actuels, sa météo relationnelle et l'inviter à consulter son [Ordonnance Relationnelle](/dashboard/citoyen/ordonnance).",
        messages: [
          {
            role: "user",
            content: `Voici le contexte complet du bilan de l'utilisateur :\n${userIqrhContext}\n\nFais une restitution personnalisée et chaleureuse d'environ 3 paragraphes pour l'aider à interpréter ses résultats, sa météo relationnelle et l'encourager à réaliser les actions prioritaires de son ordonnance. Ne lui propose JAMAIS de passer ou repasser le questionnaire puisqu'il l'a déjà complété.`,
          },
        ],
        userId,
        maxOutputTokens: 600,
      });

      if (!llmResult.degraded && llmResult.text?.trim()) {
        let cleanText = llmResult.text.trim();
        // Garde-fou de sécurité UX : suppression de toute hallucination vers /questionnaire
        if (cleanText.includes("/questionnaire")) {
          cleanText = cleanText.replace(
            /\[.*?\]\(\/questionnaire\)/gi,
            "[Consulter mon Ordonnance Relationnelle](/dashboard/citoyen/ordonnance)"
          );
        }
        return NextResponse.json({ explication: cleanText, hasAssessment: true });
      }
    } catch (groqErr) {
      console.warn("[IRIS_EXPLICATION_FALLBACK]:", groqErr);
    }

    // 2. Génération analytique experte et personnalisée (Fallback résilient haute fidélité)
    if (!result) {
      return NextResponse.json({
        hasAssessment: false,
        explication: `Bonjour **${userName}** ! Vous n'avez pas encore finalisé votre première évaluation complète IQRH.\n\nDès que vous aurez répondu au questionnaire (~8 à 10 minutes), je pourrai cartographier précisément vos 5 dimensions relationnelles, calculer votre météo relationnelle et concevoir votre ordonnance personnalisée.\n\nJe vous invite à commencer votre évaluation dès maintenant en cliquant sur [Commencer mon évaluation](/questionnaire) !`
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

    const p3 = `Pour transformer cette analyse en bénéfices durables, je vous invite à activer votre première action recommandée : **${reco1}**. Vous pouvez retrouver l'ensemble de votre protocole personnalisé dans votre [Ordonnance Relationnelle](/dashboard/citoyen/ordonnance). Abordez cette démarche avec curiosité et bienveillance, par petites victoires successives. Je reste à votre entière disposition dans cet espace pour vous accompagner à chaque étape !`;

    return NextResponse.json({ explication: `${p1}\n\n${p2}\n\n${p3}`, hasAssessment: true });

  } catch (error) {
    console.error("[IRIS_EXPLICATION_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
