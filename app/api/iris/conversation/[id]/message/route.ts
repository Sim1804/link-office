/**
 * @file route.ts
 * @module app/api/iris/conversation/[id]/message
 * @description Route API principale d'IRIS : envoie un message et retourne la réponse de coaching.
 *
 * Implémentation conforme Phase 2 :
 * - Modèle LLM centralisé : piloté via `src/lib/iris/llm.ts` (IRIS_MODEL, défaut llama-3.3-70b-versatile)
 * - Filtre de sécurité en entrée : détection détresse (3114, 15), médical, hors périmètre et jailbreak
 * - Filtre de sécurité en sortie : détection des termes médicaux/prescriptions non autorisées
 * - Quota journalier Freemium : 5 messages par jour calendaire UTC (HTTP 402 avec CTA Premium)
 * - Mode dégradé explicite : champ `degraded: true` en cas d'indisponibilité du LLM
 * - Support du streaming : Vercel AI SDK DataStream Protocol si demandé
 * - Journalisation des événements de sécurité et de latence sans exposer le contenu utilisateur
 */

import { NextResponse } from "next/server";
import { tool } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { buildIrisContext } from "@/lib/iris/context-builder";
import { GamificationService } from "@/lib/gamification/gamification-service";
import { MatchingService } from "@/lib/binome/matching-service";
import { prisma } from "@/lib/prisma";
import { generateResponse, streamResponse } from "@/lib/iris/llm";
import {
  evaluateInputSafety,
  evaluateOutputSafety,
  logSecurityEvent,
  IRIS_DAILY_QUOTA_FREEMIUM,
} from "@/lib/iris/safety";

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

    // ── Quota Freemium atomique journalier (5 messages / jour calendaire UTC, HTTP 402) ──
    if (user.subscription === "FREEMIUM") {
      const now = new Date();
      const isNewDay =
        !user.lastIrisUsage ||
        user.lastIrisUsage.toISOString().slice(0, 10) !== now.toISOString().slice(0, 10);

      const currentCount = isNewDay ? 0 : user.irisUsageCount;

      if (currentCount >= IRIS_DAILY_QUOTA_FREEMIUM) {
        return NextResponse.json(
          {
            error: "Quota journalier atteint (5 messages / jour). Passez à la formule Premium pour un accès illimité à IRIS.",
            quotaLimit: IRIS_DAILY_QUOTA_FREEMIUM,
            upgradeUrl: "/premium",
          },
          { status: 402 }
        );
      }

      // updateMany avec WHERE atomique : garantit l'absence de race condition sous forte concurrence
      const updated = await prisma.user.updateMany({
        where: {
          id: userId,
          ...(isNewDay ? {} : { irisUsageCount: { lt: IRIS_DAILY_QUOTA_FREEMIUM } }),
        },
        data: {
          irisUsageCount: isNewDay ? 1 : { increment: 1 },
          lastIrisUsage: now,
        },
      });

      if (updated.count === 0) {
        return NextResponse.json(
          {
            error: "Quota journalier atteint (5 messages / jour). Passez à la formule Premium pour un accès illimité à IRIS.",
            quotaLimit: IRIS_DAILY_QUOTA_FREEMIUM,
            upgradeUrl: "/premium",
          },
          { status: 402 }
        );
      }
    }

    // ── Filtre de sécurité programmatique d'entrée (AVANT appel LLM) ──────────
    const safetyCheck = evaluateInputSafety(userMessage);
    if (!safetyCheck.safe) {
      if (safetyCheck.category) {
        await logSecurityEvent(userId, safetyCheck.category, {
          matchedPattern: safetyCheck.matchedPattern,
          conversationId,
        });
      }

      const escalationReply =
        safetyCheck.escalationResponse ||
        "Mon accompagnement au sein de LinkOffice est exclusivement dédié à votre santé relationnelle.";

      // Persistance en base de données pour la traçabilité
      await prisma.irisMessage.create({
        data: { conversationId, role: "user", content: userMessage },
      });
      await prisma.irisMessage.create({
        data: { conversationId, role: "assistant", content: escalationReply },
      });

      return NextResponse.json({
        message_iris: escalationReply,
        safetyEscalation: true,
        category: safetyCheck.category,
        degraded: false,
      });
    }

    // ── Chargement de l'historique depuis la BDD (Sliding window 10 messages) ──
    const recentDbHistory = await prisma.irisMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { role: true, content: true },
    });
    const dbHistory = recentDbHistory.reverse();

    // Persister le message utilisateur valide immédiatement
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
      "- ⚡ DIRECTE ET SANS DÉTOUR (RÈGLE STRICTE ANTI-VERBOSITÉ & ÉCONOMIE DE JETONS) : Va DROIT AU BUT. Proscris absolument tout détour verbeux, bavardage préliminaire, préambule de complaisance ou reformulation superflue de la question. Ne commence pas par de longues formules introductives. Délivre immédiatement l'éclairage clé ou le conseil attendu.",
      "- 🎯 CONCISION MAXIMALE : Tes réponses doivent comporter STRICTEMENT 2 à 3 phrases claires et percutantes maximum. Chaque mot doit compter pour minimiser la consommation de jetons et maximiser la clarté.",
      "- Sois chaleureuse, empathique, professionnelle et encourageante sans être bavarde.",
      "- Utilise exclusivement le vouvoiement ('vous') pour t'adresser à l'utilisateur.",
      "- Si tu utilises l'outil recommend_partners, liste les partenaires trouvés clairement en français avec leurs descriptions concises.",
      "- Utilise un langage clair, sans jargon technique ou clinique.",
      "- Termine par une question ouverte courte et ciblée pour maintenir l'engagement.",
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
    const chatMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = dbHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    chatMessages.push({ role: "user", content: userMessage });

    // ── Outils fonctionnels IRIS ──────────────────────────────────────────────
    const tools = {
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

      recommend_partners: tool({
        description: "Rechercher et recommander des partenaires de confiance (psychologues, assistantes sociales, associations) selon le besoin exprimé.",
        parameters: z.object({
          need: z.string().describe("Le besoin principal (ex: 'psychologique', 'juridique', 'social', 'isolement')."),
        }),
        // @ts-expect-error — zodSchema overload mismatch in ai@7.x; runtime is correct
        execute: async ({ need }: { need: string }) => {
          try {
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
                if (searchString.includes(needLower)) score += 5;
                for (const sit of situations) {
                  if (searchString.includes(sit.toLocaleLowerCase("fr-FR"))) score += 3;
                }
                for (const dom of dominantNeeds) {
                  if (searchString.includes(dom.toLocaleLowerCase("fr-FR"))) score += 2;
                }
                if (profileName && searchString.includes(profileName.toLocaleLowerCase("fr-FR"))) {
                  score += 1;
                }

                return { item: p, score };
              })
              .filter((x) => x.score > 0)
              .sort((a, b) => b.score - a.score)
              .slice(0, 3);

            return {
              partners: scored.map((s) => ({
                id: s.item.id,
                title: s.item.title,
                category: s.item.category,
                description: (s.item.data as Record<string, unknown>)?.description ?? "",
                website: (s.item.data as Record<string, unknown>)?.site_web ?? null,
                phone: (s.item.data as Record<string, unknown>)?.telephone ?? null,
              })),
            };
          } catch (error: unknown) {
            return {
              partners: [],
              error: error instanceof Error ? error.message : "Erreur inconnue",
            };
          }
        },
      }),

      opt_in_matching: tool({
        description: "Enregistrer l'accord de l'utilisateur pour participer au programme de Binôme Relationnel.",
        parameters: z.object({
          optIn: z.boolean().default(true),
        }),
        // @ts-expect-error — zodSchema overload mismatch in ai@7.x; runtime is correct
        execute: async ({ optIn }: { optIn: boolean }) => {
          try {
            await MatchingService.setOptIn(userId, optIn ?? true);
            return { success: true };
          } catch (error: unknown) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Erreur inconnue",
            };
          }
        },
      }),

      find_relational_partner: tool({
        description: "Rechercher activement une suggestion de binôme relationnel parmi les collègues disponibles.",
        parameters: z.object({}),
        // @ts-expect-error — zodSchema overload mismatch in ai@7.x; runtime is correct
        execute: async () => {
          try {
            const matchResult = await MatchingService.findAndInvitePartner(userId);
            return matchResult;
          } catch (error: unknown) {
            return {
              found: false,
              error: error instanceof Error ? error.message : "Erreur inconnue",
            };
          }
        },
      }),
    };

    // ── Détection du streaming demandé (Option A Décision 2.2) ─────────────────
    const acceptsStream = request.headers.get("accept")?.includes("text/event-stream");
    const isStreamRequested = requestBody.stream === true || acceptsStream;

    if (isStreamRequested && process.env.GROQ_API_KEY) {
      const stream = await streamResponse({
        system: systemPrompt,
        messages: chatMessages,
        tools,
        userId,
        conversationId,
      });
      return stream.toTextStreamResponse();
    }

    // ── Mode standard (Réponse unitaire structurée) ───────────────────────────
    const llmResult = await generateResponse({
      system: systemPrompt,
      messages: chatMessages,
      tools,
      userId,
      conversationId,
    });

    let finalResponseText = llmResult.text;
    let isDegraded = llmResult.degraded;

    // En cas d'indisponibilité du LLM distant, fallback analytique local haute cohérence
    if (isDegraded) {
      const latestAssessment = await prisma.assessment.findFirst({
        where: { userId, status: "SUBMITTED" },
        orderBy: { submittedAt: "desc" },
        include: {
          result: {
            include: {
              icr: true,
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
        finalResponseText = `Pour votre dimension sentimentale, le Laboratoire du Lien Humain préconise le protocole d'« attention sanctuarisée » : définir un moment d'écoute mutuelle non négociable chaque semaine, sans écran ni contraintes logistiques. Souhaitez-vous planifier ce temps d'échange cette semaine ?`;
      } else if (q.includes("force") || q.includes("point fort") || q.includes("atout")) {
        finalResponseText = `Votre plus grand point d'appui s'exprime dans vos **${bestDim}**. C'est un véritable capital confiance qui vous permet de prendre du recul face aux imprévus. Vous pouvez vous appuyer sereinement sur ce socle.`;
      } else if (q.includes("priorité") || q.includes("faible") || q.includes("attention") || q.includes("vigilance")) {
        finalResponseText = `Votre axe de vigilance prioritaire concerne la dimension **${priorityDim}**. De légers ajustements de communication et une clarification de vos attentes mutuelles permettront de désamorcer les tensions et d'alléger votre charge mentale.`;
      } else if (q.includes("rituel") || q.includes("5 minutes") || q.includes("action") || q.includes("exercice")) {
        finalResponseText = `Je vous suggère le micro-rituel « La météo du lien » : en début de journée ou de réunion, évaluez votre niveau d'énergie relationnelle sur une échelle de 1 à 5. Cela permet d'ajuster vos échanges en toute transparence. Aimeriez-vous tester dès demain ?`;
      } else if (q.includes("binôme") || q.includes("partenaire") || q.includes("collègue")) {
        finalResponseText = `Le programme de Binôme Relationnel vous permet d'échanger en miroir avec un collègue bienveillant. Vous pouvez consulter votre statut et vos correspondances dans l'onglet « Relations & Binôme » de votre tableau de bord. Souhaitez-vous que je vous guide ?`;
      } else if (q.includes("stress") || q.includes("charge") || q.includes("fatigue") || q.includes("pression")) {
        finalResponseText = `Face à la fatigue relationnelle, il est crucial de sanctuariser des temps de récupération. Avec votre score IQRH de **${score}/100**, vous disposez de solides ressources protectrices. Prenez un moment aujourd'hui pour poser vos limites avec bienveillance.`;
      } else if (q.includes("défi") || q.includes("terminé") || q.includes("validé") || q.includes("fait")) {
        finalResponseText = `Bravo pour votre passage à l'action ! Chaque micro-défi accompli renforce durablement la santé de votre collectif et crédite votre expérience. Continuons sur cette excellente dynamique ! 🎉`;
      } else {
        finalResponseText = `C'est une excellente question. Au regard de votre bilan IQRH (${score}/100), le secret d'un équilibre durable réside dans la régularité des micro-ajustements. Souhaitez-vous que nous examinions ensemble une situation relationnelle concrète ?`;
      }
    } else {
      // Contrôle de sécurité de sortie
      const outputSafety = evaluateOutputSafety(finalResponseText);
      if (!outputSafety.safe) {
        finalResponseText = outputSafety.sanitizedContent || finalResponseText;
        await logSecurityEvent(userId, "MEDICAL", {
          matchedPattern: outputSafety.flaggedTerms?.join(", "),
          conversationId,
        });
      }
    }

    // ── Persistance de la réponse IRIS en BDD ─────────────────────────────────
    await prisma.irisMessage.create({
      data: { conversationId, role: "assistant", content: finalResponseText },
    });

    // ── Mise à jour du titre de la conversation (à la première réponse) ───────
    const messageCount = await prisma.irisMessage.count({ where: { conversationId } });
    if (messageCount === 2) {
      const titleSnippet = userMessage.length > 60 ? userMessage.slice(0, 57) + "…" : userMessage;
      await prisma.irisConversation.update({
        where: { id: conversationId },
        data: { title: titleSnippet },
      });
    }

    return NextResponse.json({
      message_iris: finalResponseText,
      degraded: isDegraded,
    });

  } catch (error) {
    console.error("[IRIS_MESSAGE_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
