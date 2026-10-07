/**
 * @file route.ts
 * @module app/api/iris/conversation/[id]/message
 * @description Route API principale d'IRIS : envoie un message et retourne la réponse de coaching.
 *
 * Améliorations v2 :
 * - Modèle Groq : mixtral-8x7b-32768 (meilleure compréhension du français et du context long)
 * - Historique persisté en BDD (IrisMessage) — continuité inter-sessions garantie
 * - Quota Freemium atomique (updateMany avec WHERE) — pas de race condition
 * - `recommend_partners` : utilise le scoring contextuel du PrescriptionService
 *
 * @method POST
 * @param id — ID de la conversation (clé primaire IrisConversation en BDD)
 * @body {{ message_user: string }} — Message utilisateur (l'historique est lu depuis la BDD)
 * @returns {{ message_iris: string }} — Réponse textuelle d'IRIS
 */

import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText, tool } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { buildIrisContext } from "@/lib/iris/context-builder";
import { GamificationService } from "@/lib/gamification/gamification-service";
import { MatchingService } from "@/lib/binome/matching-service";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── Authentification ───────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour parler à IRIS." },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const userId = session.user.id;

    // ── Validation du message entrant ──────────────────────────────────────────
    const requestBody = await request.json();
    const userMessage = requestBody.message_user as string | undefined;

    if (!userMessage?.trim()) {
      return NextResponse.json({ error: "message_user manquant" }, { status: 400 });
    }

    // ── Vérification que la conversation appartient à cet utilisateur ──────────
    const conversation = await prisma.irisConversation.findUnique({
      where: { id: conversationId },
      select: { userId: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
    }
    if (conversation.userId !== userId) {
      return NextResponse.json({ error: "Accès interdit." }, { status: 403 });
    }

    // ── Récupération de l'utilisateur (quota + abonnement) ────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: true, irisUsageCount: true, lastIrisUsage: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // ── Quota Freemium atomique (5 messages/mois, reset mensuel) ─────────────
    if (user.subscription === "FREEMIUM") {
      const now = new Date();
      const isNewMonth =
        !user.lastIrisUsage ||
        user.lastIrisUsage.getMonth() !== now.getMonth() ||
        user.lastIrisUsage.getFullYear() !== now.getFullYear();

      const currentCount = isNewMonth ? 0 : user.irisUsageCount;

      if (currentCount >= 5) {
        return NextResponse.json(
          { error: "Quota atteint. Passez à la version Premium pour continuer à discuter avec IRIS." },
          { status: 403 }
        );
      }

      // updateMany avec WHERE atomique : garantit qu'aucune race condition ne dépasse le quota
      const updated = await prisma.user.updateMany({
        where: {
          id: userId,
          ...(isNewMonth ? {} : { irisUsageCount: { lt: 5 } }),
        },
        data: {
          irisUsageCount: isNewMonth ? 1 : { increment: 1 },
          lastIrisUsage: now,
        },
      });

      if (updated.count === 0) {
        return NextResponse.json(
          { error: "Quota atteint. Passez à la version Premium pour continuer à discuter avec IRIS." },
          { status: 403 }
        );
      }
    }

    // ── Chargement de l'historique depuis la BDD ──────────────────────────────
    const dbHistory = await prisma.irisMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true },
    });

    // Persister le message utilisateur immédiatement
    await prisma.irisMessage.create({
      data: { conversationId, role: "user", content: userMessage },
    });

    // ── Construction du prompt système ────────────────────────────────────────
    const userIqrhContext = await buildIrisContext(userId);

    const systemPrompt = [
      "Tu es IRIS, l'intelligence artificielle bienveillante et coach premium de LinkOffice.",
      userIqrhContext === "NO_ASSESSMENT"
        ? "\n\nATTENTION : L'utilisateur n'a pas encore passé son évaluation IQRH.\n- Ton objectif immédiat est de l'encourager à compléter son profil et passer le test pour débloquer ton coaching personnalisé.\n- Explique-lui poliment que sans ses résultats, tu ne peux donner que des conseils très généraux.\n- Ne refuse pas la discussion, sois accueillante, mais rappelle systématiquement et de façon subtile l'importance de l'évaluation.\n- Tu peux lui fournir ce lien en markdown pour l'y encourager : [Commencer mon évaluation](/profil)"
        : `\n\nCONTEXTE UTILISATEUR:\n${userIqrhContext}\n\nUtilise ce contexte avec beaucoup de tact et d'empathie. Tu dois guider l'utilisateur vers un meilleur équilibre relationnel.`,
      "\n\nTON STYLE DE COMMUNICATION :",
      "- 🛑 TU DOIS PARLER UNIQUEMENT EN FRANÇAIS. Ne réponds JAMAIS en anglais.",
      "- Sois chaleureuse, empathique, professionnelle et encourageante.",
      "- Utilise exclusivement le vouvoiement ('vous') pour t'adresser à l'utilisateur.",
      "- Tes réponses doivent être très concises (2 à 3 phrases maximum) pour une lecture fluide.",
      "- Si tu utilises l'outil recommend_partners, liste les partenaires trouvés clairement en français avec leurs descriptions.",
      "- Utilise un langage clair, sans jargon technique ou clinique.",
      "- Termine souvent par une question ouverte pour maintenir l'engagement.",
      "\n\nGESTION DES MICRO-DÉFIS ET DE L'ORDONNANCE :",
      "L'utilisateur possède une Ordonnance Relationnelle avec des recommandations et des micro-défis (MICRO_CHALLENGE).",
      "- Prends l'initiative de lui demander des nouvelles d'un défi s'il n'en parle pas.",
      "- Encourage-le à essayer ses défis et offre-lui des conseils pratiques s'il bloque.",
      "\n\nPROGRAMME BINÔME RELATIONNEL :",
      "Si l'utilisateur semble avoir besoin de motivation, de partager avec un pair, ou se sent isolé au travail, propose-lui de trouver un Binôme parmi ses collègues.",
      "- S'il accepte ou s'il te demande de lui trouver un binôme, tu DOIS appeler l'outil `opt_in_matching` pour enregistrer son consentement, PUIS appeler `find_relational_partner` pour lancer la recherche.",
      "- S'il refuse, n'insiste pas.",
      "\n\nVALIDATION DES DÉFIS (RÈGLE STRICTE) :",
      "Si l'utilisateur indique clairement avoir réussi ou accompli un micro-défi, tu DOIS appeler l'outil `complete_micro_challenge` pour le valider.",
      "⚠️ INTERDIT : Ne dis JAMAIS que tu vas utiliser un outil ou un système. Ne mentionne JAMAIS un ID technique. Félicite-le simplement comme le ferait un vrai coach humain.",
      "\n\n🛑 PÉRIMÈTRE ET LIMITES (RÈGLE ABSOLUE) :",
      "- Ton unique rôle est le coaching en santé relationnelle, l'équilibre de vie, la QVT et la prévention des RPS.",
      "- Tu as l'INTERDICTION formelle de répondre à des questions hors de ce périmètre (programmation, mathématiques, histoire, culture générale, conseils médicaux stricts, etc.).",
      "- Si une question est hors sujet, tu DOIS poliment refuser d'y répondre et recentrer immédiatement la conversation sur le coaching relationnel.",
    ].join("\n");

    // ── Construction de l'historique pour le LLM ─────────────────────────────
    // L'historique DB contient déjà le message utilisateur qu'on vient d'insérer
    // On le reconstruit pour le LLM (sans le dernier message utilisateur qui est passé séparément)
    const chatMessages = dbHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    // Ajouter le message actuel à la fin
    chatMessages.push({ role: "user", content: userMessage });

    // ── Appel au LLM Mixtral avec tool calling ────────────────────────────────
    let irisResponse = "";

    if (process.env.GROQ_API_KEY) {
      try {
        const llmResult = await generateText({
          model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: chatMessages,
      toolChoice: "auto",
      tools: {
        /**
         * Valide un micro-défi lorsque l'utilisateur indique l'avoir accompli.
         * Déclenche GamificationService : points + badges.
         */
        complete_micro_challenge: tool({
          description: "Valider un micro-défi (MICRO_CHALLENGE) lorsque l'utilisateur indique l'avoir accompli.",
          parameters: z.object({
            challengeId: z.string().describe("L'identifiant technique du défi à valider (fourni dans le contexte)."),
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
         * Recommande des partenaires de soin (psychologues, assistants sociaux, associations)
         * en utilisant le scoring contextuel basé sur le profil IQRH de l'utilisateur.
         */
        recommend_partners: tool({
          description: "Rechercher et recommander des partenaires de confiance (psychologues, assistantes sociales, associations) selon le besoin exprimé.",
          parameters: z.object({
            need: z.string().describe("Le besoin principal (ex: 'psychologique', 'juridique', 'social', 'isolement')."),
          }),
          // @ts-expect-error — zodSchema overload mismatch in ai@7.x; runtime is correct
          execute: async ({ need }: { need: string }) => {
            try {
              // Récupération du contexte IQRH pour le scoring contextuel
              const userResult = await prisma.assessment.findFirst({
                where: { userId, status: "SUBMITTED" },
                orderBy: { submittedAt: "desc" },
                include: {
                  result: { include: { icr: true, profile: true } },
                  demographic: true,
                },
              });

              const allPartners = await prisma.libraryItem.findMany({
                where: { library: "Partenaires" },
              });

              // Scoring contextuel : utilise les champs IQRH pour mieux cibler
              const needLower = need.toLocaleLowerCase("fr-FR");
              const situations = (userResult?.demographic?.selectedSituations as string[]) ?? [];
              const dominantNeeds = (userResult?.result?.icr?.dominantNeeds as string[]) ?? [];
              const profileName = userResult?.result?.primaryProfile ?? "";

              const scored = allPartners
                .map((p) => {
                  const data = p.data as Record<string, unknown>;
                  const searchString = [
                    p.title,
                    p.category ?? "",
                    String(data?.besoins_couverts ?? ""),
                    String(data?.description ?? ""),
                    String(data?.public_cible ?? ""),
                  ]
                    .join(" ")
                    .toLocaleLowerCase("fr-FR");

                  let score = 0;

                  // Correspondance directe avec le besoin exprimé
                  if (searchString.includes(needLower)) score += 5;

                  // Situations de vie de l'utilisateur
                  if (situations.some((s) => searchString.includes(s.toLocaleLowerCase("fr-FR")))) score += 3;

                  // Besoins dominants ICR
                  if (dominantNeeds.some((n) => searchString.includes(n.toLocaleLowerCase("fr-FR")))) score += 2;

                  // Profil relationnel
                  if (profileName && searchString.includes(profileName.toLocaleLowerCase("fr-FR"))) score += 1;

                  return { partner: p, score };
                })
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

              // Fallback : si aucun match, retourner les 2 premiers partenaires
              const results = scored.length > 0 ? scored : allPartners.slice(0, 2).map((p) => ({ partner: p, score: 0 }));

              return {
                success: true,
                partners: results.map(({ partner }) => {
                  const data = partner.data as Record<string, unknown>;
                  return {
                    id: partner.id,
                    title: partner.title,
                    category: partner.category,
                    type: data?.type_partenaire,
                    description: data?.description,
                    territoire: data?.territoire,
                  };
                }),
              };
            } catch (_error: unknown) {
              return { success: false, error: "Impossible de récupérer les partenaires." };
            }
          },
        }),

        /**
         * Enregistre le consentement de l'utilisateur pour le programme de Binôme Relationnel.
         */
        opt_in_matching: tool({
          description: "Enregistre le consentement de l'utilisateur pour participer au programme de Binôme Relationnel.",
          parameters: z.object({}),
          // @ts-expect-error AI SDK tool typing mismatch
          execute: async () => {
            try {
              await MatchingService.setOptIn(userId, true);
              return { success: true, message: "Consentement enregistré avec succès." };
            } catch (_error: unknown) {
              return { success: false, error: "Erreur lors de l'enregistrement du consentement." };
            }
          },
        }),

        /**
         * Lance l'algorithme de matching pour trouver un Binôme compatible dans la même campagne.
         */
        find_relational_partner: tool({
          description: "Cherche un partenaire de binôme compatible et crée l'invitation.",
          parameters: z.object({}),
          // @ts-expect-error AI SDK tool typing mismatch
          execute: async () => {
            try {
              const result = await MatchingService.findAndInvitePartner(userId);
              return result;
            } catch (_error: unknown) {
              return { success: false, error: "Erreur lors de la recherche de partenaire." };
            }
          },
        }),
      },
    });

    const rawResponseText = llmResult.text;
        irisResponse = rawResponseText
          ? rawResponseText
              .replace(/<function\b[^>]*>(.*?)<\/function>/gi, "")
              .replace(/<tool_call\b[^>]*>(.*?)<\/tool_call>/gi, "")
              .trim()
          : "";
      } catch (groqError) {
        console.warn("[IRIS_GROQ_CALL_FAILED_FALLING_BACK]:", groqError);
      }
    }

    // ── Fallback intelligent basé sur le profil réel de l'utilisateur ─────────
    if (!irisResponse) {
      const latestAssessment = await prisma.assessment.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: {
          result: {
            include: {
              profile: true,
              prescription: { include: { items: true } },
            },
          },
        },
      });

      const q = userMessage.toLowerCase();
      const res = latestAssessment?.result;
      const score = Math.round(res?.globalScore ?? 80);
      const priorityDim = res?.priorityDimension ? res.priorityDimension.replace("_", " ").toLowerCase() : "coopération";
      const bestDim = res?.bestDimension ? res.bestDimension.replace("_", " ").toLowerCase() : "relations affectives";

      if (q.includes("sentimentale") || q.includes("couple") || q.includes("intime")) {
        irisResponse = `Pour votre dimension sentimentale, le Laboratoire du Lien Humain préconise le protocole d'« attention sanctuarisée » : définir un moment d'écoute mutuelle non négociable chaque semaine, sans écran ni contraintes logistiques. Souhaitez-vous planifier ce temps d'échange cette semaine ?`;
      } else if (q.includes("force") || q.includes("point fort") || q.includes("atout")) {
        irisResponse = `Votre plus grand point d'appui s'exprime dans vos **${bestDim}**. C'est un véritable capital confiance qui vous permet de prendre du recul face aux imprévus. Vous pouvez vous appuyer sereinement sur ce socle.`;
      } else if (q.includes("priorité") || q.includes("faible") || q.includes("attention") || q.includes("vigilance")) {
        irisResponse = `Votre axe de vigilance prioritaire concerne la dimension **${priorityDim}**. De légers ajustements de communication et une clarification de vos attentes mutuelles permettront de désamorcer les tensions et d'alléger votre charge mentale.`;
      } else if (q.includes("rituel") || q.includes("5 minutes") || q.includes("action") || q.includes("exercice")) {
        irisResponse = `Je vous suggère le micro-rituel « La météo du lien » : en début de journée ou de réunion, évaluez votre niveau d'énergie relationnelle sur une échelle de 1 à 5. Cela permet d'ajuster vos échanges en toute transparence. Aimeriez-vous tester dès demain ?`;
      } else if (q.includes("binôme") || q.includes("partenaire") || q.includes("collègue")) {
        irisResponse = `Le programme de Binôme Relationnel vous permet d'échanger en miroir avec un collègue bienveillant. Vous pouvez consulter votre statut et vos correspondances dans l'onglet « Relations & Binôme » de votre tableau de bord. Souhaitez-vous que je vous guide ?`;
      } else if (q.includes("stress") || q.includes("charge") || q.includes("fatigue") || q.includes("pression")) {
        irisResponse = `Face à la fatigue relationnelle, il est crucial de sanctuariser des temps de récupération. Avec votre score IQRH de **${score}/100**, vous disposez de solides ressources protectrices. Prenez un moment aujourd'hui pour poser vos limites avec bienveillance.`;
      } else if (q.includes("défi") || q.includes("terminé") || q.includes("validé") || q.includes("fait")) {
        irisResponse = `Bravo pour votre passage à l'action ! Chaque micro-défi accompli renforce durablement la santé de votre collectif et crédite votre expérience. Continuons sur cette excellente dynamique ! 🎉`;
      } else {
        irisResponse = `C'est une excellente question. Au regard de votre bilan IQRH (${score}/100), le secret d'un équilibre durable réside dans la régularité des micro-ajustements. Souhaitez-vous que nous examinions ensemble une situation relationnelle concrète ?`;
      }
    }

    // ── Persistance de la réponse IRIS en BDD ─────────────────────────────────
    await prisma.irisMessage.create({
      data: { conversationId, role: "assistant", content: irisResponse },
    });

    // ── Mise à jour du titre de la conversation (à la première réponse) ───────
    const messageCount = await prisma.irisMessage.count({ where: { conversationId } });
    if (messageCount === 2) {
      // 1 user + 1 assistant = première réponse : on génère un titre court
      const titleSnippet = userMessage.length > 60 ? userMessage.slice(0, 57) + "…" : userMessage;
      await prisma.irisConversation.update({
        where: { id: conversationId },
        data: { title: titleSnippet },
      });
    }

    return NextResponse.json({ message_iris: irisResponse });

  } catch (error) {
    console.error("[IRIS_MESSAGE_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
