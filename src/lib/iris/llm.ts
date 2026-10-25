import { groq } from "@ai-sdk/groq";
import { generateText, streamText, LanguageModel } from "ai";
import { EventLogger } from "@/lib/logger";
import {
  getLlmConfig,
  resolveApiKey,
  type IrisLlmConfig,
  type LlmProvider,
} from "./llm-config";

/**
 * Construit l'instance du modèle LLM à partir de la configuration active.
 * Groq est importé statiquement (provider par défaut du projet).
 * Les autres providers sont chargés dynamiquement si configurés.
 * Retourne null si le provider est indisponible (clé API manquante ou SDK absent).
 */
async function buildModelInstance(config: IrisLlmConfig): Promise<LanguageModel | null> {
  const apiKey = resolveApiKey(config);
  if (!apiKey) {
    console.warn(
      `[IRIS_LLM] Clé API manquante pour le provider "${config.provider}" (env: ${config.apiKeyRef})`
    );
    return null;
  }

  switch (config.provider as LlmProvider) {
    case "groq":
      // Import statique — provider par défaut du projet (SDK déjà installé)
      return groq(config.model);

    case "openai": {
      try {
        // @ts-expect-error — SDK optionnel, installé uniquement si OpenAI est configuré
        const { openai } = await import(/* webpackIgnore: true */ "@ai-sdk/openai");
        return openai(config.model);
      } catch {
        console.error("[IRIS_LLM] @ai-sdk/openai non installé. Exécutez : npm install @ai-sdk/openai");
        return null;
      }
    }

    case "anthropic": {
      try {
        // @ts-expect-error — SDK optionnel
        const { anthropic } = await import(/* webpackIgnore: true */ "@ai-sdk/anthropic");
        return anthropic(config.model);
      } catch {
        console.error("[IRIS_LLM] @ai-sdk/anthropic non installé. Exécutez : npm install @ai-sdk/anthropic");
        return null;
      }
    }

    case "mistral": {
      try {
        // @ts-expect-error — SDK optionnel
        const { mistral } = await import(/* webpackIgnore: true */ "@ai-sdk/mistral");
        return mistral(config.model);
      } catch {
        console.error("[IRIS_LLM] @ai-sdk/mistral non installé. Exécutez : npm install @ai-sdk/mistral");
        return null;
      }
    }

    default:
      console.error(`[IRIS_LLM] Provider non reconnu : ${config.provider}`);
      return null;
  }
}


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
  provider: string;
}

const DEGRADED_RESPONSE = "Je suis actuellement en mode de maintenance allégé. Je reste à votre entière disposition pour répondre à vos questions prioritaires sur votre bilan relationnel.";
const DEGRADED_STREAM_ERROR = "Je rencontre une indisponibilité momentanée avec mon moteur d'analyse. En attendant, je vous invite à explorer les micro-défis recommandés dans votre ordonnance relationnelle.";

/**
 * Génère une réponse textuelle complète (mode unitaire).
 * Lit la configuration LLM active depuis la BDD (cache 60s).
 * Journalise la latence et le modèle sans stocker le contenu utilisateur.
 */
export async function generateResponse(options: LlmCallOptions): Promise<LlmResponseOutput> {
  const startTime = performance.now();

  // Lecture config dynamique (BDD + cache mémoire)
  const config = await getLlmConfig();
  const maxOutputTokens = options.maxOutputTokens ?? config.maxOutputTokens;

  // Résolution du modèle LLM
  const modelInstance = await buildModelInstance(config);

  if (!modelInstance) {
    const latencyMs = Math.round(performance.now() - startTime);
    console.warn(`[IRIS_LLM] Provider "${config.provider}" indisponible — mode dégradé (${latencyMs}ms).`);
    return {
      text: DEGRADED_RESPONSE,
      degraded: true,
      latencyMs,
      model: "fallback-local",
      provider: config.provider,
    };
  }

  // Utilisation du system prompt override si configuré par le superadmin
  const systemPrompt = config.systemPromptOverride || options.system;

  try {
    const generateOptions: any = {
      model: modelInstance,
      system: systemPrompt,
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
          model: config.model,
          provider: config.provider,
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
      model: config.model,
      provider: config.provider,
    };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    console.error(
      `[IRIS_LLM_ERROR] Échec provider "${config.provider}" modèle "${config.model}" après ${latencyMs}ms:`,
      error?.message || error
    );

    if (options.userId) {
      await EventLogger.log({
        userId: options.userId,
        eventType: "iris_llm_degraded_fallback",
        eventData: {
          model: config.model,
          provider: config.provider,
          latencyMs,
          degraded: true,
          errorMessage: error?.message,
        },
      });
    }

    return {
      text: DEGRADED_STREAM_ERROR,
      degraded: true,
      latencyMs,
      model: config.model,
      provider: config.provider,
    };
  }
}

/**
 * Diffuse une réponse sous forme de flux en temps réel (Streaming via streamText).
 * Lit la configuration LLM active depuis la BDD (cache 60s).
 */
export async function streamResponse(options: LlmCallOptions) {
  const startTime = performance.now();

  // Lecture config dynamique (BDD + cache mémoire)
  const config = await getLlmConfig();
  const maxOutputTokens = options.maxOutputTokens ?? config.maxOutputTokens;

  const modelInstance = await buildModelInstance(config);

  if (!modelInstance) {
    throw new Error(`LLM_PROVIDER_UNAVAILABLE:${config.provider}`);
  }

  const systemPrompt = config.systemPromptOverride || options.system;

  const streamOptions: any = {
    model: modelInstance,
    system: systemPrompt,
    messages: options.messages as any,
    maxOutputTokens,
    onFinish: async (event: any) => {
      const latencyMs = Math.round(performance.now() - startTime);
      if (options.userId) {
        await EventLogger.log({
          userId: options.userId,
          eventType: "iris_llm_stream_finished",
          eventData: {
            model: config.model,
            provider: config.provider,
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

  return streamText(streamOptions);
}
