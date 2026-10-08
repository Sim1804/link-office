/**
 * @file llm.ts
 * @module lib/iris/llm
 * @description Point unique et centralisé d'appel au modèle d'IA pour IRIS (Vercel AI SDK + Groq).
 *
 * Expose `generateResponse` et `streamResponse`, pilote le modèle via `IRIS_MODEL`
 * (défaut : `llama-3.3-70b-versatile`), mesure la latence d'inférence, journalise sans
 * exposer le contenu utilisateur, et gère le mode dégradé explicite en cas d'indisponibilité.
 */

import { groq } from "@ai-sdk/groq";
import { generateText, streamText } from "ai";
import { EventLogger } from "@/lib/logger";

/**
 * Nom du modèle LLM validé pour IRIS (configurable par variable d'environnement).
 * Modèle par défaut ultra-rapide et éprouvé sur Groq avec structured output et streaming : qwen/qwen3.8-27b
 */
export const IRIS_MODEL = process.env.IRIS_MODEL || "qwen/qwen3.8-27b";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LlmCallOptions {
  system: string;
  messages: ChatMessage[];
  tools?: any;
  toolChoice?: "auto" | "none" | "required";
  maxOutputTokens?: number;
  maxSteps?: number;
  userId?: string;
  conversationId?: string;
}

export interface LlmResponseOutput {
  text: string;
  degraded: boolean;
  latencyMs: number;
  model: string;
}

/**
 * Génère une réponse textuelle complète (mode unitaire).
 * Journalise la latence et le modèle sans stocker le contenu de l'utilisateur.
 */
export async function generateResponse(options: LlmCallOptions): Promise<LlmResponseOutput> {
  const startTime = performance.now();
  const maxOutputTokens = options.maxOutputTokens ?? 350;

  if (!process.env.GROQ_API_KEY) {
    const latencyMs = Math.round(performance.now() - startTime);
    console.warn(`[IRIS_LLM] GROQ_API_KEY non définie. Bascule en mode dégradé (${latencyMs}ms).`);
    return {
      text: "Je suis actuellement en mode de maintenance simplifiée. Je reste à votre écoute pour vos questions prioritaires sur votre bilan relationnel.",
      degraded: true,
      latencyMs,
      model: "fallback-local",
    };
  }

  try {
    const generateOptions: any = {
      model: groq(IRIS_MODEL),
      system: options.system,
      messages: options.messages as any,
      maxOutputTokens,
    };

    if (options.tools) {
      generateOptions.tools = options.tools;
      generateOptions.toolChoice = options.toolChoice || "auto";
      generateOptions.maxSteps = options.maxSteps ?? 3;
    }

    const result = await generateText(generateOptions);

    const latencyMs = Math.round(performance.now() - startTime);

    if (options.userId) {
      await EventLogger.log({
        userId: options.userId,
        eventType: "iris_llm_inference",
        eventData: {
          model: IRIS_MODEL,
          latencyMs,
          degraded: false,
          tokenUsage: result.usage,
        },
      });
    }

    return {
      text: result.text,
      degraded: false,
      latencyMs,
      model: IRIS_MODEL,
    };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    console.error(`[IRIS_LLM_ERROR] Échec de l'appel Groq (${IRIS_MODEL}) après ${latencyMs}ms:`, error?.message || error);

    if (options.userId) {
      await EventLogger.log({
        userId: options.userId,
        eventType: "iris_llm_degraded_fallback",
        eventData: {
          model: IRIS_MODEL,
          latencyMs,
          degraded: true,
          errorMessage: error?.message,
        },
      });
    }

    return {
      text: "Je rencontre une indisponibilité momentanée avec mon moteur d'analyse. En attendant, je vous invite à explorer les micro-défis recommandés dans votre ordonnance relationnelle.",
      degraded: true,
      latencyMs,
      model: IRIS_MODEL,
    };
  }
}

/**
 * Diffuse une réponse sous forme de flux en temps réel (Streaming via streamText).
 */
export async function streamResponse(options: LlmCallOptions) {
  const startTime = performance.now();
  const maxOutputTokens = options.maxOutputTokens ?? 400;

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY_MISSING");
  }

  const streamOptions: any = {
    model: groq(IRIS_MODEL),
    system: options.system,
    messages: options.messages as any,
    maxOutputTokens,
    onFinish: async (event: any) => {
      const latencyMs = Math.round(performance.now() - startTime);
      if (options.userId) {
        await EventLogger.log({
          userId: options.userId,
          eventType: "iris_llm_stream_finished",
          eventData: {
            model: IRIS_MODEL,
            latencyMs,
            degraded: false,
            finishReason: event.finishReason,
          },
        });
      }
    },
  };

  if (options.tools) {
    streamOptions.tools = options.tools;
    streamOptions.toolChoice = options.toolChoice || "auto";
    streamOptions.maxSteps = options.maxSteps ?? 3;
  }

  const stream = streamText(streamOptions);

  return stream;
}
