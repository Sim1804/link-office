/**
 * @file route.ts
 * @module app/api/iris/conversation/[id]/message
 * @description Route API pour envoyer un message à IRIS et recevoir sa réponse.
 *
 * IRIS est l'IA de coaching relationnel de LinkOffice, propulsée par Groq + Llama 3.3 70B.
 * Cette route implémente un cycle complet de conversation :
 *
 * 1. Authentification de l'utilisateur
 * 2. Construction du contexte IQRH personnalisé (`buildIrisContext`)
 * 3. Appel au LLM Groq avec historique de conversation
 * 4. Gestion du tool calling : IRIS peut valider un micro-défi via `complete_micro_challenge`
 * 5. Nettoyage du texte de réponse (suppression des balises de tool_call parasites)
 *
 * FONCTIONNEMENT DU TOOL CALLING :
 * Quand l'utilisateur dit à IRIS qu'il a accompli un défi, IRIS appelle automatiquement
 * l'outil `complete_micro_challenge` avec l'ID du défi. Ceci déclenche le `GamificationService`
 * pour attribuer les points — sans que l'utilisateur ait à cliquer sur un bouton.
 * Le flag `compatible_iris: Oui` dans les métadonnées CSV d'un défi autorise cette validation.
 *
 * @method POST
 * @param id - L'identifiant de la conversation (paramètre d'URL, pour futur historique BDD)
 * @body {{ message_user: string, history: ModelMessage[] }} — Message utilisateur + historique
 * @returns {{ message_iris: string }} — La réponse textuelle d'IRIS
 * @throws {401} Si l'utilisateur n'est pas connecté
 * @throws {400} Si le message utilisateur est vide
 * @throws {500} En cas d'erreur Groq ou BDD
 */

import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText, tool } from "ai";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { buildIrisContext } from "@/lib/iris/context-builder";
import { GamificationService } from "@/lib/gamification/gamification-service";
import { MatchingService } from "@/lib/binome/matching-service";
import { prisma } from "@/lib/prisma";

/**
 * Envoie un message utilisateur à IRIS et retourne sa réponse de coaching.
 *
 * @param request - Requête HTTP avec `{ message_user, history }`
 * @param context - Paramètres d'URL Next.js (contient `id` de la conversation)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour parler à IRIS." },
        { status: 401 }
      );
    }

    await params; // Consommation du paramètre d'URL (requis par Next.js même si non utilisé)
    const userId = session.user.id;

    const requestBody = await request.json();
    const userMessage = requestBody.message_user as string | undefined;
    const conversationHistory = (requestBody.history as ModelMessage[]) ?? [];

    if (!userMessage?.trim()) {
      return NextResponse.json({ error: "message_user manquant" }, { status: 400 });
    }

    // ── Vérification du Quota IRIS (Limitation Freemium) ──────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true, irisUsageCount: true, lastIrisUsage: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.subscription === "FREEMIUM") {
      const now = new Date();
      let newCount = user.irisUsageCount;

      // Réinitialisation au 1er de chaque mois
      if (
        !user.lastIrisUsage || 
        user.lastIrisUsage.getMonth() !== now.getMonth() || 
        user.lastIrisUsage.getFullYear() !== now.getFullYear()
      ) {
        newCount = 0;
      }

      if (newCount >= 5) {
        return NextResponse.json(
          { error: "Quota atteint. Passez à la version Premium pour continuer à discuter avec IRIS." },
          { status: 403 }
        );
      }

      // Mise à jour du compteur pour cette requête
      await prisma.user.update({
        where: { id: userId },
        data: { irisUsageCount: newCount + 1, lastIrisUsage: now }
      });
    }

    // ── Construction du prompt système personnalisé ───────────────────────────
    const userIqrhContext = await buildIrisContext(userId);

    const systemPrompt = [
      "Tu es IRIS, l'intelligence artificielle bienveillante et coach premium de LinkOffice.",
      userIqrhContext
        ? `\n\nCONTEXTE UTILISATEUR:\n${userIqrhContext}\n\nUtilise ce contexte avec beaucoup de tact et d'empathie. Tu dois guider l'utilisateur vers un meilleur équilibre relationnel.`
        : "",
      "\n\nTON STYLE DE COMMUNICATION :",
      "- Sois chaleureuse, empathique, professionnelle et encourageante.",
      "- Utilise exclusivement le vouvoiement ('vous') pour t'adresser à l'utilisateur.",
      "- Tes réponses doivent être très concises (2 à 3 phrases maximum) pour une lecture fluide.",
      "- Utilise un langage clair, sans jargon technique ou clinique.",
      "- Termine souvent par une question ouverte pour maintenir l'engagement.",
      "\n\nGESTION DES MICRO-DÉFIS ET DE L'ORDONNANCE :",
      "L'utilisateur possède une Ordonnance Relationnelle avec des recommandations et des micro-défis (MICRO_CHALLENGE).",
      "- Prends l'initiative de lui demander des nouvelles d'un défi s'il n'en parle pas.",
      "- Encourage-le à essayer ses défis et offre-lui des conseils pratiques s'il bloque.",
      "\n\nPROGRAMME BINÔME RELATIONNEL (PHASE 5) :",
      "Si l'utilisateur semble avoir besoin de motivation, de partager avec un pair, ou se sent isolé au travail, propose-lui de trouver un **Binôme** parmi ses collègues (dans sa campagne).",
      "- S'il accepte ou s'il te demande de lui trouver un binôme, tu DOIS appeler l'outil `opt_in_matching` pour enregistrer son consentement, PUIS appeler `find_relational_partner` pour lancer la recherche.",
      "- S'il refuse, n'insiste pas.",
      "\n\nVALIDATION DES DÉFIS (RÈGLE STRICTE) :",
      "Si l'utilisateur indique clairement avoir réussi ou accompli un micro-défi, tu DOIS appeler l'outil `complete_micro_challenge` pour le valider.",
      "⚠️ INTERDIT : Ne dis JAMAIS que tu vas utiliser un outil ou un système. Ne mentionne JAMAIS un ID technique (ex: 'MOD1_Q3'). Félicite-le simplement comme le ferait un vrai coach humain.",
    ].join("\n");

    // ── Construction des messages de conversation ────────────────────────────
    const chatMessages: ModelMessage[] = [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // ── Appel au LLM avec tool calling ───────────────────────────────────────
    const llmResult = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: chatMessages,
      toolChoice: "auto", // IRIS choisit librement d'utiliser ou non l'outil
      tools: {
        /**
         * Outil de validation de micro-défi.
         * IRIS l'appelle quand l'utilisateur indique avoir accompli un défi compatible.
         * Déclenche `GamificationService.completeChallenge()` en arrière-plan.
         */
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
        /**
         * Outil de recommandation de partenaires (Care Routing).
         * IRIS l'appelle si l'utilisateur exprime un besoin de soutien spécifique (ex: santé mentale, juridique).
         */
        recommend_partners: tool({
          description: "Rechercher et recommander un ou plusieurs partenaires de confiance (psychologues, assistantes sociales, associations) en fonction d'un besoin exprimé par l'utilisateur.",
          parameters: z.object({
            need: z.string().describe("Le besoin principal de l'utilisateur (ex: 'psychologique', 'juridique', 'social', 'isolement').")
          }),
          // @ts-expect-error — zodSchema overload mismatch in ai@7.x; runtime is correct
          execute: async ({ need }: { need: string }) => {
            try {
              const partners = await prisma.libraryItem.findMany({
                where: { library: "Partenaires" },
                take: 3
              });
              
              // On filtre basiquement en mémoire pour trouver les partenaires qui correspondent au besoin
              const matched = partners.filter(p => {
                const data = p.data as any;
                const searchString = `${p.title} ${p.category} ${data?.besoins_couverts} ${data?.description}`.toLowerCase();
                return searchString.includes(need.toLowerCase());
              });

              return { 
                success: true, 
                partners: (matched.length > 0 ? matched : partners.slice(0, 2)).map(p => {
                  const data = p.data as any;
                  return { id: p.id, title: p.title, category: p.category, type: data?.type_partenaire, description: data?.description, territoire: data?.territoire };
                }) 
              };
            } catch (error: unknown) {
              return { success: false, error: "Impossible de récupérer les partenaires." };
            }
          }
        }),
        /**
         * Outil d'opt-in pour le Binôme Relationnel.
         * IRIS l'appelle si l'utilisateur accepte qu'on lui cherche un binôme.
         */
        opt_in_matching: tool({
          description: "Enregistre le consentement de l'utilisateur pour participer au programme de Binôme Relationnel.",
          parameters: z.object({}),
          // @ts-expect-error
          execute: async () => {
            try {
              await MatchingService.setOptIn(userId, true);
              return { success: true, message: "Consentement enregistré avec succès." };
            } catch (error: unknown) {
              return { success: false, error: "Erreur lors de l'enregistrement du consentement." };
            }
          }
        }),
        /**
         * Outil de recherche de partenaire de Binôme.
         * IRIS l'appelle APRES l'opt-in pour lancer l'algorithme de matching.
         */
        find_relational_partner: tool({
          description: "Cherche un partenaire de binôme compatible dans la même campagne et crée l'invitation.",
          parameters: z.object({}),
          // @ts-expect-error
          execute: async () => {
            try {
              const result = await MatchingService.findAndInvitePartner(userId);
              return result;
            } catch (error: unknown) {
              return { success: false, error: "Erreur lors de la recherche de partenaire." };
            }
          }
        }),

      },
    });

    // ── Nettoyage de la réponse ───────────────────────────────────────────────
    // Si le modèle a terminé sur un tool_call, il peut générer du texte parasite.
    // On supprime les éventuelles balises XML de function/tool_call.
    const rawResponseText = llmResult.text;
    const cleanedIrisResponse = rawResponseText
      ? rawResponseText
          .replace(/<function\b[^>]*>(.*?)<\/function>/gi, "")
          .replace(/<tool_call\b[^>]*>(.*?)<\/tool_call>/gi, "")
          .trim()
      : "Bravo ! Je viens de valider ton défi. Continue comme ça, tu progresses vraiment bien ! 🎉";

    return NextResponse.json({ message_iris: cleanedIrisResponse });

  } catch (error) {
    console.error("[IRIS_MESSAGE_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
