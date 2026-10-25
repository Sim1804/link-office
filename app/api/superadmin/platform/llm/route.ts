/**
 * @file route.ts
 * @module app/api/superadmin/platform/llm
 * @description API de gestion de la configuration LLM pour l'interface superadmin.
 *
 * Permet au superadmin de :
 * - Lire la configuration LLM active (GET)
 * - Mettre à jour le provider/modèle sans modifier le code (PATCH)
 *
 * Sécurité :
 * - Accès réservé au rôle SUPER_ADMIN (vérifié en BDD via session)
 * - Les clés API ne sont JAMAIS stockées en BDD, seule la référence à la
 *   variable d'environnement est enregistrée
 * - Toute modification est journalisée dans SystemConfig avec l'ID du superadmin
 * - Validation stricte des providers et modèles acceptés
 * - Invalidation du cache mémoire LLM après chaque modification
 *
 * @method GET — Retourne la config LLM active + disponibilité des providers
 * @method PATCH — Met à jour la config LLM (provider, modèle, tokens, prompt)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getLlmConfig,
  getProvidersAvailability,
  invalidateLlmConfigCache,
  PROVIDER_MODELS,
  PROVIDER_ENV_KEYS,
  DEFAULT_LLM_CONFIG,
  type LlmProvider,
} from "@/lib/iris/llm-config";

const SYSTEM_CONFIG_KEY = "iris_llm_config";

/** Vérifie que la session appartient bien à un SUPER_ADMIN */
async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

/**
 * GET /api/superadmin/platform/llm
 * Retourne la configuration LLM active et la disponibilité des providers.
 */
export async function GET() {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const config = await getLlmConfig();
    const availability = getProvidersAvailability();

    // Ne jamais retourner les clés API, seulement la référence
    return NextResponse.json({
      config: {
        provider: config.provider,
        model: config.model,
        maxOutputTokens: config.maxOutputTokens,
        systemPromptOverride: config.systemPromptOverride,
        fallbackEnabled: config.fallbackEnabled,
        rateLimitPerUser: config.rateLimitPerUser,
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
      },
      providers: {
        available: availability,
        models: PROVIDER_MODELS,
        envKeys: PROVIDER_ENV_KEYS, // Noms des variables d'env, pas les valeurs
      },
    });
  } catch (error) {
    console.error("[SUPERADMIN_LLM_GET]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH /api/superadmin/platform/llm
 * Met à jour la configuration LLM active.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const {
      provider,
      model,
      maxOutputTokens,
      systemPromptOverride,
      fallbackEnabled,
      rateLimitPerUser,
    } = body;

    // ── Validation stricte du provider ─────────────────────────────────────
    const validProviders: LlmProvider[] = ["groq", "openai", "anthropic", "mistral"];
    if (provider && !validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Provider invalide. Valeurs acceptées : ${validProviders.join(", ")}` },
        { status: 400 }
      );
    }

    // ── Validation stricte du modèle ────────────────────────────────────────
    const targetProvider: LlmProvider = provider || (await getLlmConfig()).provider;
    const availableModels = PROVIDER_MODELS[targetProvider];
    if (model && !availableModels.includes(model)) {
      return NextResponse.json(
        { error: `Modèle invalide pour le provider "${targetProvider}". Modèles disponibles : ${availableModels.join(", ")}` },
        { status: 400 }
      );
    }

    // ── Validation des bornes numériques ────────────────────────────────────
    if (maxOutputTokens !== undefined) {
      if (typeof maxOutputTokens !== "number" || maxOutputTokens < 100 || maxOutputTokens > 4000) {
        return NextResponse.json(
          { error: "maxOutputTokens doit être un entier entre 100 et 4000" },
          { status: 400 }
        );
      }
    }
    if (rateLimitPerUser !== undefined) {
      if (typeof rateLimitPerUser !== "number" || rateLimitPerUser < 1 || rateLimitPerUser > 100) {
        return NextResponse.json(
          { error: "rateLimitPerUser doit être un entier entre 1 et 100" },
          { status: 400 }
        );
      }
    }

    // ── Lecture de la config actuelle pour la fusion partielle ──────────────
    const currentConfig = await getLlmConfig();

    const newValue = {
      provider: provider || currentConfig.provider,
      model: model || (provider ? availableModels[0] : currentConfig.model),
      apiKeyRef: PROVIDER_ENV_KEYS[(provider || currentConfig.provider) as LlmProvider],
      maxOutputTokens: maxOutputTokens ?? currentConfig.maxOutputTokens,
      systemPromptOverride:
        systemPromptOverride !== undefined
          ? (systemPromptOverride === "" ? null : systemPromptOverride)
          : currentConfig.systemPromptOverride,
      fallbackEnabled: fallbackEnabled !== undefined ? !!fallbackEnabled : currentConfig.fallbackEnabled,
      rateLimitPerUser: rateLimitPerUser ?? currentConfig.rateLimitPerUser,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id,
    };

    // ── Persistance en BDD (upsert) ─────────────────────────────────────────
    await prisma.systemConfig.upsert({
      where: { key: SYSTEM_CONFIG_KEY },
      create: { key: SYSTEM_CONFIG_KEY, value: newValue },
      update: { value: newValue },
    });

    // ── Invalidation du cache mémoire ───────────────────────────────────────
    invalidateLlmConfigCache();

    console.info(
      `[SUPERADMIN_LLM] Config mise à jour par ${session.user.id} : provider=${newValue.provider} model=${newValue.model}`
    );

    return NextResponse.json({
      message: "Configuration LLM mise à jour avec succès",
      config: {
        provider: newValue.provider,
        model: newValue.model,
        maxOutputTokens: newValue.maxOutputTokens,
        systemPromptOverride: newValue.systemPromptOverride,
        fallbackEnabled: newValue.fallbackEnabled,
        rateLimitPerUser: newValue.rateLimitPerUser,
        updatedAt: newValue.updatedAt,
      },
    });
  } catch (error) {
    console.error("[SUPERADMIN_LLM_PATCH]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/superadmin/platform/llm
 * Remet la configuration LLM à ses valeurs par défaut.
 */
export async function DELETE() {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const defaultValue = {
      ...DEFAULT_LLM_CONFIG,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id,
    };

    await prisma.systemConfig.upsert({
      where: { key: SYSTEM_CONFIG_KEY },
      create: { key: SYSTEM_CONFIG_KEY, value: defaultValue },
      update: { value: defaultValue },
    });

    invalidateLlmConfigCache();

    console.info(`[SUPERADMIN_LLM] Config réinitialisée aux valeurs par défaut par ${session.user.id}`);

    return NextResponse.json({
      message: "Configuration LLM réinitialisée aux valeurs par défaut",
      config: defaultValue,
    });
  } catch (error) {
    console.error("[SUPERADMIN_LLM_DELETE]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
