/**
 * @file prisma.ts
 * @module lib
 * @description Instance singleton du client Prisma ORM partagée dans toute l'application.
 *
 * PROBLÈME RÉSOLU : En développement, Next.js recharge les modules à chaud (Hot Module Reload).
 * Sans ce pattern Singleton, chaque rechargement crée une nouvelle instance `PrismaClient`,
 * ce qui épuise rapidement le pool de connexions PostgreSQL (erreur "Too many connections").
 *
 * SOLUTION : L'instance est stockée sur `globalThis` (persistant entre les reloads)
 * et réutilisée si elle existe déjà.
 *
 * ROBUSTESSE : Configuration du pool de connexions pour tolérer les coupures réseau
 * (ex: redémarrage PostgreSQL local, scale-to-zero Neon, erreur `E57P01 admin_shutdown`).
 * Prisma reconnecte automatiquement grâce au paramètre `connect_timeout` dans l'URL
 * et à la stratégie `lazy` (connexion ouverte à la première requête, pas au boot).
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from "@prisma/client";

/** Extension du type global pour persister l'instance Prisma entre les reloads HMR */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Client Prisma unique (Singleton).
 *
 * Configuration :
 * - `datasourceUrl` : Override de la DATABASE_URL avec paramètres de résilience réseau.
 *   - `connect_timeout=10`       : Timeout de connexion TCP en secondes (défaut Prisma : pas de timeout).
 *   - `pool_timeout=20`          : Timeout pour obtenir une connexion du pool.
 *   - `socket_timeout=30`        : Timeout pour une réponse à une requête active.
 *   - `connection_limit=10`      : Taille maximale du pool (compatible dev local + Vercel serverless).
 *
 * - `log` : Errors et warnings en dev ; errors seulement en production.
 *   Activer `"query"` pour déboguer le SQL généré par Prisma (très verbeux).
 *
 * @note La reconnexion automatique est native à Prisma : si une connexion du pool
 * est trouvée morte (TCP RST, `E57P01`), Prisma en ouvre une nouvelle transparaitement
 * à la prochaine requête. Aucune configuration manuelle de retry n'est nécessaire.
 */
function buildPrismaClient(): PrismaClient {
  const baseUrl = process.env.DATABASE_URL ?? "";

  // Injection des paramètres de résilience dans l'URL si elle ne les contient pas déjà.
  // Compatible PostgreSQL local, Neon pooler (pgbouncer), et Neon direct.
  let datasourceUrl = baseUrl;
  try {
    const url = new URL(baseUrl);
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "10");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "20");
    }
    // `connection_limit` n'est pertinent que pour le driver natif (pas pgbouncer)
    if (!url.searchParams.has("connection_limit") && !url.searchParams.has("pgbouncer")) {
      url.searchParams.set("connection_limit", "10");
    }
    datasourceUrl = url.toString();
  } catch {
    // URL invalide ou variable manquante — on laisse Prisma gérer l'erreur de démarrage
    datasourceUrl = baseUrl;
  }

  return new PrismaClient({
    datasources: datasourceUrl ? { db: { url: datasourceUrl } } : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? buildPrismaClient();

// En dehors de la production, on attache l'instance à globalThis pour la réutiliser
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
