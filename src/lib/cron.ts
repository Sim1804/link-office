/**
 * @file cron.ts
 * @module lib/cron
 * @description Utilitaire de vérification sécurisée de l'authentification des tâches Cron Vercel.
 *
 * Utilise l'en-tête standard `Authorization: Bearer <CRON_SECRET>` et une comparaison
 * cryptographique à temps constant (`crypto.timingSafeEqual`) pour prévenir toute
 * attaque par canal auxiliaire (timing attack).
 */

import crypto from "crypto";

/**
 * Valide le jeton secret envoyé par le scheduler de Cron (Vercel ou déclencheur externe).
 *
 * @param request - La requête HTTP reçue par la route API Cron.
 * @returns `true` si le jeton Bearer correspond strictement et à temps constant à CRON_SECRET, `false` sinon.
 */
export function validateCronSecret(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Si aucun secret n'est configuré sur le serveur, refuser l'exécution par défaut
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice(7).trim();
  const tokenBuffer = Buffer.from(token, "utf-8");
  const secretBuffer = Buffer.from(cronSecret, "utf-8");

  if (tokenBuffer.length !== secretBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(tokenBuffer, secretBuffer);
}
