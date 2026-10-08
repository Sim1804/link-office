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
  evaluateInputSafetyCascaded,
  evaluateOutputSafety,
  logSecurityEvent,
  IRIS_DAILY_QUOTA_FREEMIUM,
} from "@/lib/iris/safety";
import { checkDistributedRateLimit, getDistributedRetryAfterSeconds } from "@/lib/rate-limit";

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

    // ── Rate Limiting Distribué anti-flood (20 requêtes / minute par utilisateur) ──
    const rateLimitKey = `iris:${userId}`;
    const rateLimitRes = await checkDistributedRateLimit(rateLimitKey, { limit: 20, windowMs: 60_000 });
    if (!rateLimitRes.success) {
      const retryAfter = await getDistributedRetryAfterSeconds(rateLimitKey, 60_000);
      return NextResponse.json(
        { error: `Trop de requêtes rapides. Réessayez dans ${retryAfter} seconde(s).` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
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

    // ── Filtre de sécurité programmatique d'entrée en cascade (AVANT appel LLM) ──
    const safetyCheck = await evaluateInputSafetyCascaded(userMessage, userId);
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

    // ── Chargement de l'historique depuis la BDD (Sliding window 20 messages pour dialogue continu) ──
    const recentDbHistory = await prisma.irisMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { role: true, content: true },
    });
    const dbHistory = recentDbHistory.reverse();

    // Persister le message utilisateur valide immédiatement
    await prisma.irisMessage.create({
      data: { conversationId, role: "user", content: userMessage },
    });

    // ── Construction du prompt système ────────────────────────────────────────
    const userIqrhContext = await buildIrisContext(userId);

    const linkOfficeKnowledgeBase = `
BASE DE CONNAISSANCES OFFICIELLE LINKOFFICE (MÉTHODOLOGIE ET EXPERTISE) :

1. L'IQRH (Indice de Qualité Relationnelle et Humaine) :
- Définition : Indice scientifique sur 100 mesurant la qualité, la solidité et l'équilibre du capital relationnel d'un individu ou d'un collectif.
- Calcul : Évalué via le questionnaire psychométrique LinkOffice (~8 à 10 minutes) explorant comportements, ressentis et satisfaction sur 5 dimensions pondérées.
- Indicateurs clés associés :
  * ICR (Indice de Complexité Relationnelle, sur 100) : mesure l'exigence et les frictions de l'écosystème relationnel (faible < 35, modéré 35-65, élevé > 65).
  * IER (Indice d'Équilibre Relationnel) : mesure l'harmonie et l'homogénéité de répartition entre les dimensions.
  * Météo Relationnelle : statut synthétique dynamique (Beau fixe, Éclaircies, Nuageux, Orageux).
  * 12 Profils Relationnels : Connecteur, Ancre, Catalyseur, Stratège, Négociateur, Médiateur, Pilier, Sentinelle, Explorateur, Inspirateur, Diplomate, Fédérateur.

2. Les 5 Dimensions du Climat Relationnel LinkOffice :
- 1. Dimension Sociale : Réseau relationnel élargi, sentiment d'appartenance, force protectrice des micro-interactions et liens faibles au quotidien.
- 2. Dimension Affective : Liens de confiance profonde, écoute sincère, soutien émotionnel des pairs et proches.
- 3. Vie Sentimentale / Intime : Sphère intime, équilibre affectif personnel, sécurité dans les relations privées.
- 4. Vie Professionnelle : Coopération, sécurité psychologique, reconnaissance et équité managériale au travail.
- 5. Relation à Soi : Écoute de ses propres besoins et limites, auto-bienveillance, régulation de la charge mentale.

3. Fonctionnement du Coaching IA IRIS :
- Rôle : Coach IA d'intelligence relationnelle, bienveillant, confidentiel et pragmatique.
- Parcours d'accompagnement :
  * Analyse approfondie du bilan IQRH pour révéler forces et leviers de progression.
  * Génération d'une Ordonnance Relationnelle sur-mesure avec recommandations et micro-défis hebdomadaires progressifs.
  * Dialogue continu pour surmonter les blocages, préparer des discussions et désamorcer les tensions.
  * Suivi gamifié (validation des défis, points, badges).
  * Facilitation du programme Binôme Relationnel en entreprise.

4. Solutions pour les Organisations (Entreprises, Collectivités, Mutuelles) :
- Baromètre d'équipe et Climat Social : Mesure du bien-être relationnel collectif, 100% anonymisée avec k-anonymat strict (seuil >= 5 répondants).
- Prévention RPS & QVCT : Détection précoce des signaux faibles d'épuisement ou de dégradation du climat d'équipe.
- Programme Binôme Relationnel : Mise en relation de pairs volontaires pour briser les silos, créer de l'entraide et favoriser l'intégration.
- Plans d'Actions RH & Managériaux : Recommandations opérationnelles pour les managers et DRH pour assainir les dynamiques d'équipe.
- Portails dédiés : B2B (entreprises), B2G (collectivités territoriales), B2B2C (mutuelles et réseaux de santé).

RÈGLE D'OR DE COHÉRENCE ET PÉDAGOGIE :
- Si l'utilisateur pose une question méthodologique, conceptuelle ou sur le fonctionnement (notamment sur le score IQRH, les 5 dimensions, le coaching IRIS ou les offres pour les organisations) : réponds TOUJOURS de manière exhaustive, pédagogique, structurée et valorisante avec les concepts exacts ci-dessus.
- Ne refuse JAMAIS de répondre sous prétexte que l'utilisateur n'a pas encore passé son évaluation ! Si l'évaluation n'est pas encore complétée, délivre la réponse complète et invite ensuite chaleureusement à passer son évaluation [Commencer mon évaluation](/questionnaire) pour découvrir son diagnostic personnel.`;

    const systemPrompt = [
      "Tu es IRIS, l'intelligence relationnelle bienveillante et coach expert de LinkOffice.",
      linkOfficeKnowledgeBase,
      userIqrhContext === "NO_ASSESSMENT"
        ? "\n\nCONTEXTE UTILISATEUR : L'utilisateur n'a pas encore finalisé son évaluation IQRH. Réponds toujours avec bienveillance et expertise à ses questions, et invite-le avec tact à passer son évaluation [Commencer mon évaluation](/questionnaire) pour obtenir son diagnostic personnalisé."
        : `\n\nCONTEXTE UTILISATEUR:\n${userIqrhContext}\n\nUtilise ce contexte avec tact et empathie pour personnaliser tes conseils.`,
      "\n\nTON STYLE DE COMMUNICATION :",
      "- 🛑 TU DOIS PARLER UNIQUEMENT EN FRANÇAIS. Ne réponds JAMAIS en anglais.",
      "- Utilise exclusivement le vouvoiement ('vous') pour t'adresser à l'utilisateur.",
      "- Pour les questions explicatives ou méthodologiques (IQRH, 5 dimensions, offres organisations, rôle d'IRIS) : structure clairement ta réponse (points clés, mise en valeur avec du gras ou puces).",
      "- Pour les questions de coaching personnel : va à l'essentiel avec chaleur et bienveillance, et termine par une question ouverte ciblée.",
      "- Si tu utilises l'outil recommend_partners, liste les partenaires trouvés clairement en français avec leurs descriptions concises.",
      "- Utilise un langage clair, sans jargon technique ou clinique excessif.",
      "\n\nRÈGLES FONDAMENTALES DU DIALOGUE CONTINU :",
      "- Continuité et mémoire : Tu as accès à l'historique complet des messages échangés. Fais des liens directs et fluides avec ce que l'utilisateur a partagé plus tôt ('Comme vous l'indiquiez...', 'Pour approfondir votre réflexion sur...').",
      "- Pas de salutations répétées : Une fois la conversation engagée (dès le second message), ne redis JAMAIS 'Bonjour', 'Je suis IRIS', ou 'En tant que coach'. Réponds directement avec proximité et professionnalisme.",
      "- Approfondissement progressif : Si l'utilisateur pose une question de suivi ou demande des précisions sur un point spécifique, apporte une réponse concrète, pratique, enrichie d'exemples de situations vécues au travail ou dans la vie quotidienne.",
      "- Orthographe et syntaxe irréprochables : Rédige dans un français impeccable, soigné, chaleureux et professionnel. Respecte scrupuleusement la typographie française (espaces insécables avant les ponctuations doubles, tirets élégants).",
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

    // ── Détection du streaming demandé (Option A Décision 2.2 & C3) ───────────
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

      // Contrôle de sécurité de sortie en flux avec ReadableStream et vérification en temps réel (C3)
      let accumulatedOutput = "";
      const textStream = stream.textStream;
      const reader = textStream.getReader();

      const customStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              accumulatedOutput += value;

              // Vérification de sortie en temps réel contre les hallucinations médicales
              const outputSafety = evaluateOutputSafety(accumulatedOutput);
              if (!outputSafety.safe) {
                // Interception immédiate du flux en cours de diffusion
                const warningMsg = "\n\n[Message interrompu : IRIS ne peut délivrer de conseil médical ou d'ordonnance. Veuillez consulter un professionnel de santé.]";
                if (acceptsStream) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: warningMsg })}\n\n`));
                } else {
                  controller.enqueue(encoder.encode(warningMsg));
                }
                await logSecurityEvent(userId, "MEDICAL", {
                  matchedPattern: outputSafety.flaggedTerms?.join(", "),
                  conversationId,
                }).catch(() => {});
                controller.close();
                return;
              }

              // Émission conforme SSE (data: ...) ou texte brut
              if (acceptsStream) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: value })}\n\n`));
              } else {
                controller.enqueue(encoder.encode(value));
              }
            }

            if (acceptsStream) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
            controller.close();

            // Persistance de la réponse générée en base de données
            if (accumulatedOutput) {
              await prisma.irisMessage.create({
                data: { conversationId, role: "assistant", content: accumulatedOutput },
              }).catch(console.error);
            }
          } catch (streamErr) {
            controller.error(streamErr);
          }
        },
      });

      return new Response(customStream, {
        headers: {
          "Content-Type": acceptsStream ? "text/event-stream; charset=utf-8" : "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
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
    const isDegraded = llmResult.degraded;

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

      if (q.includes("dimension") || q.includes("5")) {
        finalResponseText = "Les 5 dimensions du climat relationnel LinkOffice sont :\n\n1. **Dimension Sociale** : Réseau relationnel élargi, sentiment d'appartenance et liens faibles protecteurs au quotidien.\n2. **Dimension Affective** : Liens de confiance profonde, écoute sincère et soutien émotionnel des pairs.\n3. **Vie Sentimentale / Intime** : Sphère privée, sécurité affective et équilibre dans les relations proches.\n4. **Vie Professionnelle** : Coopération, sécurité psychologique, reconnaissance et équité managériale au travail.\n5. **Relation à Soi** : Écoute de ses propres limites, auto-bienveillance et régulation de la charge mentale.\n\nSouhaitez-vous que nous approfondissions l'une de ces dimensions ou que nous l'appliquions à votre quotidien ?";
      } else if (q.includes("organisation") || q.includes("entreprise") || q.includes("pro") || q.includes("équipe") || q.includes("solution")) {
        finalResponseText = "LinkOffice propose aux organisations un accompagnement complet et éprouvé :\n\n• **Baromètre d'équipe et Climat Social** : Mesure du bien-être relationnel collectif, 100% anonymisée avec k-anonymat strict (dès 5 répondants).\n• **Programme Binôme Relationnel** : Mise en relation de pairs volontaires pour briser les silos, créer de l'entraide et favoriser l'intégration.\n• **Plans d'actions RH & managériaux** : Recommandations opérationnelles pour prévenir les RPS et améliorer la QVCT.\n• **Portails dédiés** : B2B (entreprises), B2G (collectivités) et B2B2C (mutuelles et réseaux de santé).\n\nSouhaitez-vous découvrir comment déployer ces solutions au sein de votre structure ?";
      } else if (q.includes("iris") || q.includes("coach") || q.includes("ia") || q.includes("fonctionne")) {
        finalResponseText = "En tant que coach d'intelligence relationnelle, mon accompagnement repose sur 4 piliers fondamentaux :\n\n1. **Analyse de votre bilan IQRH** pour identifier vos forces motrices et vos leviers d'amélioration.\n2. **Ordonnance Relationnelle sur-mesure** avec des recommandations personnalisées et des micro-défis hebdomadaires progressifs.\n3. **Dialogue continu** pour surmonter vos blocages, préparer des discussions sensibles ou désamorcer des tensions.\n4. **Validation des défis** et suivi gamifié de votre progression relationnelle.\n\nSur quel défi ou enjeu relationnel souhaiteriez-vous avancer aujourd'hui ?";
      } else if (q.includes("calcul") || q.includes("score") || q.includes("iqrh")) {
        finalResponseText = "Votre score IQRH (Indice de Qualité Relationnelle et Humaine, sur 100) est issu du questionnaire psychométrique LinkOffice (~8 à 10 minutes).\n\nIl mesure l'équilibre de vos 5 dimensions de vie fondamentales, enrichi de l'ICR (Complexité Relationnelle), de l'IER (Équilibre Relationnel) et de votre Météo relationnelle dynamique.\n\nPour obtenir votre diagnostic individuel précis, vous pouvez compléter votre évaluation : [Commencer mon évaluation](/questionnaire).";
      } else if (q.includes("sentimentale") || q.includes("couple") || q.includes("intime")) {
        finalResponseText = "Pour votre dimension sentimentale, le Laboratoire du Lien Humain préconise le protocole d'« attention sanctuarisée » : définir un moment d'écoute mutuelle non négociable chaque semaine, sans écran ni contraintes logistiques. Souhaitez-vous planifier ce temps d'échange cette semaine ?";
      } else if (q.includes("force") || q.includes("point fort") || q.includes("atout")) {
        finalResponseText = `Votre plus grand point d'appui s'exprime dans vos **${bestDim}**. C'est un véritable capital confiance qui vous permet de prendre du recul face aux imprévus. Vous pouvez vous appuyer sereinement sur ce socle.`;
      } else if (q.includes("priorité") || q.includes("faible") || q.includes("attention") || q.includes("vigilance")) {
        finalResponseText = `Votre axe de vigilance prioritaire concerne la dimension **${priorityDim}**. De légers ajustements de communication et une clarification de vos attentes mutuelles permettront de désamorcer les tensions et d'alléger votre charge mentale.`;
      } else if (q.includes("rituel") || q.includes("5 minutes") || q.includes("action") || q.includes("exercice")) {
        finalResponseText = "Je vous suggère le micro-rituel « La météo du lien » : en début de journée ou de réunion, évaluez votre niveau d'énergie relationnelle sur une échelle de 1 à 5. Cela permet d'ajuster vos échanges en toute transparence. Aimeriez-vous le tester dès demain ?";
      } else if (q.includes("binôme") || q.includes("partenaire") || q.includes("collègue")) {
        finalResponseText = "Le programme de Binôme Relationnel vous permet d'échanger en miroir avec un collègue bienveillant. Vous pouvez consulter votre statut et vos correspondances dans l'onglet « Relations & Binôme » de votre tableau de bord. Souhaitez-vous que je vous guide ?";
      } else if (q.includes("stress") || q.includes("charge") || q.includes("fatigue") || q.includes("pression")) {
        finalResponseText = res
          ? `Face à la fatigue relationnelle, il est crucial de sanctuariser des temps de récupération. Avec votre score IQRH de **${score}/100**, vous disposez de solides ressources protectrices. Prenez un moment aujourd'hui pour poser vos limites avec bienveillance.`
          : "Face à la fatigue relationnelle, il est crucial de sanctuariser des temps de récupération et de poser des limites claires. Souhaitez-vous que nous explorions ensemble des micro-actions simples pour préserver votre énergie ?";
      } else if (q.includes("défi") || q.includes("terminé") || q.includes("validé") || q.includes("fait")) {
        finalResponseText = "Bravo pour votre passage à l'action ! Chaque micro-défi accompli renforce durablement la santé de votre collectif et crédite votre expérience. Continuons sur cette excellente dynamique ! 🎉";
      } else {
        finalResponseText = res
          ? `C'est une excellente question. Au regard de votre bilan IQRH (${score}/100), le secret d'un équilibre durable réside dans la régularité des micro-ajustements au quotidien. Souhaitez-vous que nous examinions ensemble une situation relationnelle concrète ?`
          : "C'est une excellente question sur vos dynamiques relationnelles. Le secret d'un équilibre durable réside dans la régularité des micro-ajustements au quotidien. Pour obtenir votre diagnostic personnalisé complet, vous pouvez démarrer votre évaluation : [Commencer mon évaluation](/questionnaire). Avez-vous une situation concrète à partager ?";
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
