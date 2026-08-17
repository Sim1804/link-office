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
 * En production, chaque worker Node.js ne démarre qu'une seule fois,
 * donc `globalThis` n'est pas nécessaire — mais il n'est pas nocif non plus.
 *
 * @example
 * import { prisma } from "@/lib/prisma";
 * const users = await prisma.user.findMany();
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-from-creating-new-instances-of-prismaclient
 */

import { PrismaClient } from "@prisma/client";

/** Extension du type global pour persister l'instance Prisma entre les reloads HMR */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Client Prisma unique (Singleton).
 *
 * Configuration des logs :
 * - En développement : logs des erreurs et avertissements uniquement (pas les requêtes, trop verbeux)
 * - En production    : erreurs uniquement
 *
 * @note Pour activer les logs de requêtes SQL en développement (débogage),
 * remplacer `["error", "warn"]` par `["query", "info", "warn", "error"]`.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

// En dehors de la production, on attache l'instance à globalThis pour la réutiliser
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
