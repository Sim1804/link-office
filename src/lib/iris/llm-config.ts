/**
 * @file llm-config.ts
 * @module lib/iris/llm-config
 * @description Service de configuration LLM dynamique pour IRIS.
 *
 * Lit la configuration du modèle LLM depuis la table `SystemConfig` en BDD,
 * avec un cache mémoire de 60 secondes pour éviter les requêtes DB à chaque
 * appel IRIS. Fallback sur les variables d'environnement si la config BDD
 * est absente ou invalide.
 *
 * Sécurité : les clés API ne sont JAMAIS stockées en BDD.
 * Seule la référence au nom de la variable d'env est stockée (`apiKeyRef`).
 * La clé réelle est toujours lue depuis `process.env`.
 *
 * @see SystemConfig — table Prisma clé/valeur
 * @see llm.ts — consommateur de cette configuration
 */

import { prisma } from "@/lib/prisma";

/** Providers LLM supportés par IRIS */
export type LlmProvider = "groq" | "openai" | "anthropic" | "mistral";

/** Modèles disponibles par provider */
export const PROVIDER_MODELS: Record<LlmProvider, string[]> = {
  groq: [
    "qwen/qwen3.8-27b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ],
  openai: [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
  ],
  anthropic: [
    "claude-3-5-sonnet-20241022",
    "claude-3-haiku-20240307",
    "claude-3-opus-20240229",
  ],
  mistral: [
    "mistral-large-latest",
    "mistral-small-latest",
    "open-mistral-7b",
  ],
};

/** Clé de la variable d'env associée à chaque provider */
export const PROVIDER_ENV_KEYS: Record<LlmProvider, string> = {
  groq: "GROQ_API_KEY",
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  mistral: "MISTRAL_API_KEY",
};

/** Structure de la configuration LLM stockée dans SystemConfig */
export interface IrisLlmConfig {
  provider: LlmProvider;
  model: string;
  /** Référence au nom de la variable d'env (jamais la clé en clair) */
  apiKeyRef: string;
  maxOutputTokens: number;
  /** Override du prompt système IRIS (null = utiliser le défaut codé en dur) */
  systemPromptOverride: string | null;
  fallbackEnabled: boolean;
  rateLimitPerUser: number;
  updatedAt: string;
  updatedBy: string | null;
}

const SYSTEM_CONFIG_KEY = "iris_llm_config";
const CACHE_TTL_MS = 60_000; // 60 secondes

/** Cache mémoire simple (in-process) */
let _cachedConfig: IrisLlmConfig | null = null;
let _cacheExpiry = 0;

/** Valeurs par défaut si aucune config en BDD */
export const DEFAULT_LLM_CONFIG: IrisLlmConfig = {
  provider: "groq",
  model: process.env.IRIS_MODEL || "qwen/qwen3.8-27b",
  apiKeyRef: "GROQ_API_KEY",
  maxOutputTokens: 800,
  systemPromptOverride: null,
  fallbackEnabled: true,
  rateLimitPerUser: 20,
  updatedAt: new Date().toISOString(),
  updatedBy: null,
};

/**
 * Retourne la configuration LLM active.
 * Priorité : cache mémoire → SystemConfig BDD → valeurs par défaut.
 *
 * @returns La configuration LLM validée
 */
export async function getLlmConfig(): Promise<IrisLlmConfig> {
  const now = Date.now();

  // Retourner depuis le cache si encore valide
  if (_cachedConfig && now < _cacheExpiry) {
    return _cachedConfig;
  }

  try {
    const record = await prisma.systemConfig.findUnique({
      where: { key: SYSTEM_CONFIG_KEY },
    });

    if (record?.value && typeof record.value === "object") {
      const raw = record.value as Partial<IrisLlmConfig>;
      const config = validateAndNormalizeConfig(raw);

      _cachedConfig = config;
      _cacheExpiry = now + CACHE_TTL_MS;
      return config;
    }
  } catch (error) {
    console.error("[LLM_CONFIG] Erreur lecture SystemConfig, fallback env:", error);
  }

  // Fallback sur les variables d'environnement
  _cachedConfig = DEFAULT_LLM_CONFIG;
  _cacheExpiry = now + CACHE_TTL_MS;
  return DEFAULT_LLM_CONFIG;
}

/**
 * Invalide le cache mémoire pour forcer la relecture BDD au prochain appel.
 * À appeler après toute modification de la config via l'UI superadmin.
 */
export function invalidateLlmConfigCache(): void {
  _cachedConfig = null;
  _cacheExpiry = 0;
}

/**
 * Lit la clé API réelle depuis `process.env` en utilisant la référence stockée.
 * Ne lit JAMAIS depuis la BDD.
 *
 * @param config La configuration LLM active
 * @returns La clé API ou null si non définie
 */
export function resolveApiKey(config: IrisLlmConfig): string | null {
  return process.env[config.apiKeyRef] || null;
}

/**
 * Vérifie si un provider est opérationnel (sa clé API est disponible dans l'env).
 *
 * @param provider Le provider à vérifier
 * @returns true si la clé API est présente dans l'environnement
 */
export function isProviderAvailable(provider: LlmProvider): boolean {
  const envKey = PROVIDER_ENV_KEYS[provider];
  return !!process.env[envKey];
}

/**
 * Retourne l'état de disponibilité de chaque provider configuré.
 */
export function getProvidersAvailability(): Record<LlmProvider, boolean> {
  const providers: LlmProvider[] = ["groq", "openai", "anthropic", "mistral"];
  return Object.fromEntries(
    providers.map((p) => [p, isProviderAvailable(p)])
  ) as Record<LlmProvider, boolean>;
}

/**
 * Valide et normalise une config brute lue depuis la BDD.
 * Protège contre les valeurs corrompues ou manquantes.
 */
function validateAndNormalizeConfig(raw: Partial<IrisLlmConfig>): IrisLlmConfig {
  const validProviders: LlmProvider[] = ["groq", "openai", "anthropic", "mistral"];

  const provider: LlmProvider =
    raw.provider && validProviders.includes(raw.provider as LlmProvider)
      ? (raw.provider as LlmProvider)
      : DEFAULT_LLM_CONFIG.provider;

  const availableModels = PROVIDER_MODELS[provider];
  const model =
    raw.model && availableModels.includes(raw.model)
      ? raw.model
      : availableModels[0];

  return {
    provider,
    model,
    apiKeyRef: PROVIDER_ENV_KEYS[provider],
    maxOutputTokens:
      typeof raw.maxOutputTokens === "number" &&
      raw.maxOutputTokens >= 100 &&
      raw.maxOutputTokens <= 4000
        ? raw.maxOutputTokens
        : DEFAULT_LLM_CONFIG.maxOutputTokens,
    systemPromptOverride:
      typeof raw.systemPromptOverride === "string" && raw.systemPromptOverride.length > 0
        ? raw.systemPromptOverride
        : null,
    fallbackEnabled:
      typeof raw.fallbackEnabled === "boolean"
        ? raw.fallbackEnabled
        : DEFAULT_LLM_CONFIG.fallbackEnabled,
    rateLimitPerUser:
      typeof raw.rateLimitPerUser === "number" &&
      raw.rateLimitPerUser >= 1 &&
      raw.rateLimitPerUser <= 100
        ? raw.rateLimitPerUser
        : DEFAULT_LLM_CONFIG.rateLimitPerUser,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    updatedBy: raw.updatedBy || null,
  };
}
