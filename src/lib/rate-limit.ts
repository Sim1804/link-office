/**
 * src/lib/rate-limit.ts — Rate Limiter Distribué PostgreSQL (Sliding Window)
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilise la table `RateLimitAttempt` pour garantir un contrôle d'accès cohérent
 * entre toutes les instances serverless, prévenant le contournement par cold starts.
 *
 * Inclut un mécanisme de fallback en mémoire en cas d'indisponibilité de la base.
 */
import { prisma } from "@/lib/prisma";

export interface RateLimitOptions {
  /** Nombre maximum de requêtes dans la fenêtre. Défaut : 5 */
  limit?: number;
  /** Durée de la fenêtre en millisecondes. Défaut : 60 000 (1 min) */
  windowMs?: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetSeconds: number;
}

// Store en mémoire de secours (fallback de résilience)
interface MemoryEntry {
  count: number;
  resetAt: number;
}
const memoryFallbackStore = new Map<string, MemoryEntry>();

function fallbackMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memoryFallbackStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryFallbackStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/**
 * Vérifie le taux de requêtes de manière distribuée et asynchrone contre PostgreSQL.
 * @param key Clé d'identification (ex: "login:alice@test.fr", "register:192.168.1.1", "iris:user-123")
 * @param options Limite et fenêtre temporelle
 */
export async function checkDistributedRateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  const resetSeconds = Math.ceil(windowMs / 1000);

  try {
    // 1. Compter les tentatives existantes dans la fenêtre glissante
    const currentCount = await prisma.rateLimitAttempt.count({
      where: {
        key,
        timestamp: { gte: windowStart },
      },
    });

    if (currentCount >= limit) {
      return {
        success: false,
        remaining: 0,
        resetSeconds,
      };
    }

    // 2. Enregistrer la nouvelle tentative
    await prisma.rateLimitAttempt.create({
      data: {
        key,
        timestamp: now,
      },
    });

    // 3. Purge opportuniste des enregistrements obsolètes (> 2x fenêtre)
    const purgeThreshold = new Date(now.getTime() - windowMs * 2);
    prisma.rateLimitAttempt.deleteMany({
      where: {
        key,
        timestamp: { lt: purgeThreshold },
      },
    }).catch(() => {});

    return {
      success: true,
      remaining: Math.max(0, limit - (currentCount + 1)),
      resetSeconds,
    };
  } catch (error) {
    console.error(`[RATE_LIMIT_ERROR] Erreur PostgreSQL sur la clé ${key}, bascule sur le store mémoire:`, error);
    const allowed = fallbackMemoryRateLimit(key, limit, windowMs);
    return {
      success: allowed,
      remaining: allowed ? 1 : 0,
      resetSeconds,
    };
  }
}

/**
 * Wrapper asynchrone retournant un simple booléen (compatibilité fluide).
 */
export async function rateLimitAsync(
  key: string,
  options?: RateLimitOptions
): Promise<boolean> {
  const res = await checkDistributedRateLimit(key, options);
  return res.success;
}

/**
 * Pour compatibilité synchrone legacy (utilise le fallback mémoire).
 * @deprecated Utiliser `checkDistributedRateLimit` ou `rateLimitAsync` pour la persistance distribuée.
 */
export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: RateLimitOptions = {}
): boolean {
  return fallbackMemoryRateLimit(key, limit, windowMs);
}

/**
 * Récupère le temps d'attente restant en secondes via PostgreSQL.
 */
export async function getDistributedRetryAfterSeconds(
  key: string,
  windowMs: number = 60_000
): Promise<number> {
  try {
    const oldestInWindow = await prisma.rateLimitAttempt.findFirst({
      where: { key, timestamp: { gte: new Date(Date.now() - windowMs) } },
      orderBy: { timestamp: "asc" },
    });
    if (!oldestInWindow) return Math.ceil(windowMs / 1000);
    const elapsed = Date.now() - oldestInWindow.timestamp.getTime();
    return Math.max(1, Math.ceil((windowMs - elapsed) / 1000));
  } catch {
    return Math.ceil(windowMs / 1000);
  }
}

export function getRetryAfterSeconds(key: string): number {
  const entry = memoryFallbackStore.get(key);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));
}
