/**
 * src/lib/rate-limit.ts — Protection brute-force en mémoire
 * ──────────────────────────────────────────────────────────
 * Solution légère sans dépendance externe.
 * En production avec plusieurs instances, remplacer par Redis (Upstash).
 *
 * Usage :
 *   const allowed = rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
 *   if (!allowed) return 429;
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Nettoyage périodique pour éviter les fuites mémoire (toutes les 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Nombre maximum de requêtes dans la fenêtre. Défaut : 5 */
  limit?: number;
  /** Durée de la fenêtre en millisecondes. Défaut : 60 000 (1 min) */
  windowMs?: number;
}

/**
 * Vérifie si une clé dépasse la limite de taux.
 * @returns `true` si la requête est autorisée, `false` si elle doit être bloquée.
 */
export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: RateLimitOptions = {}
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

/**
 * Retourne le nombre de secondes avant la réinitialisation de la fenêtre.
 */
export function getRetryAfterSeconds(key: string): number {
  const entry = store.get(key);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));
}
