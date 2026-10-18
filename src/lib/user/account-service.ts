import { prisma } from "@/lib/prisma";

/**
 * Supprime un compte utilisateur en conformité stricte avec l'Article 17 du RGPD (Droit à l'effacement).
 *
 * Exécute une transaction atomique :
 * 1. Supprime les journaux EventLog associés à l'utilisateur (EventLog ne possédant pas de clé étrangère avec cascade).
 * 2. Supprime l'utilisateur de la table User, déclenchant les cascades relationnelles automatiques sur toutes les tables liées.
 */
export async function deleteUserAccount(userId: string) {
  return await prisma.$transaction(async (tx) => {
    // Récupérer l'email de l'utilisateur pour purger les identifiants orphelins (NextAuth)
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // 1. Purge des journaux d'événements (EventLog.userId orphelin sans FK)
    await tx.eventLog.deleteMany({
      where: { userId },
    });

    // 2. Purge des tokens de vérification NextAuth et rate limits orphelins
    if (user?.email) {
      await tx.verificationToken.deleteMany({
        where: { identifier: user.email },
      });
      await tx.rateLimitAttempt.deleteMany({
        where: {
          key: { in: [`login:${user.email}`, `iris:${userId}`] },
        },
      });
    }

    // 3. Suppression de l'utilisateur avec propagation cascade intégrale
    return await tx.user.delete({
      where: { id: userId },
    });
  });
}
