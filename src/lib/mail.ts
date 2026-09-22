/**
 * @file mail.ts
 * @module lib/mail
 * @description Service d'envoi d'emails (MOCK pour le mode développement).
 * Affiche les liens directement dans la console serveur au lieu de les envoyer par SMTP.
 */

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Simule l'envoi d'un email de vérification d'adresse.
 */
export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${domain}/auth/verify?token=${token}`;

  console.log("=========================================");
  console.log("📧 [MOCK EMAIL] Vérification d'email");
  console.log(`À: ${email}`);
  console.log(`Lien de confirmation : ${confirmLink}`);
  console.log("=========================================");
}

/**
 * Simule l'envoi d'un lien magique (Magic Link) pour connexion sans mot de passe.
 */
export async function sendMagicLinkEmail(email: string, token: string) {
  const loginLink = `${domain}/auth/verify?token=${token}&type=magic-link`;

  console.log("=========================================");
  console.log("🪄 [MOCK EMAIL] Lien Magique B2B");
  console.log(`À: ${email}`);
  console.log(`Lien de connexion : ${loginLink}`);
  console.log("=========================================");
}
