/**
 * @file gamification.ts
 * @module lib
 * @description Utilitaires de calcul du système de gamification de LinkOffice.
 *
 * Ce fichier expose des fonctions pures (sans base de données) utilisées côté client
 * et serveur pour calculer l'expérience, le niveau et la progression d'un utilisateur.
 *
 * La logique de persistance (attribution des points, déblocage des badges) est dans :
 * @see lib/gamification/gamification-service.ts — Service avec accès BDD
 *
 * @see src/components/dashboard/GamificationSummary.tsx — Composant qui affiche le résultat
 */

// ─────────────────────────────────────────────────────────────────────────────
// SYSTÈME DE NIVEAUX
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule le niveau et l'avancement XP d'un utilisateur à partir de son total de points.
 *
 * Formule de progression des niveaux (triangulaire) :
 * - Niveau 1 → Niveau 2 : 100 pts
 * - Niveau 2 → Niveau 3 : 200 pts
 * - Niveau N → Niveau N+1 : N × 100 pts
 *
 * Cumul de points par niveau :
 * - Niveau 1 : 0 pts
 * - Niveau 2 : 100 pts
 * - Niveau 3 : 300 pts
 * - Niveau 4 : 600 pts
 * - Niveau N : (N-1) × N / 2 × 100 pts
 *
 * Cette progression rend les premiers niveaux accessibles rapidement (engagement précoce)
 * tout en maintenant un challenge sur le long terme.
 *
 * @param totalPoints - Total de points cumulés par l'utilisateur (entier ≥ 0)
 * @returns Un objet décrivant l'état de gamification actuel :
 *   - `level` : Niveau actuel (1 minimum)
 *   - `totalPoints` : Total de points repassé en sortie (pour commodité)
 *   - `currentLevelXp` : XP accumulée depuis le début du niveau actuel
 *   - `xpNeededForNextLevel` : XP totale requise pour passer au niveau suivant
 *   - `progressPercent` : Pourcentage de progression vers le niveau suivant (0–100)
 *
 * @example
 * calculateLevel(0)
 * // { level: 1, totalPoints: 0, currentLevelXp: 0, xpNeededForNextLevel: 100, progressPercent: 0 }
 *
 * @example
 * calculateLevel(150)
 * // { level: 2, totalPoints: 150, currentLevelXp: 50, xpNeededForNextLevel: 200, progressPercent: 25 }
 *
 * @example
 * calculateLevel(350)
 * // { level: 3, totalPoints: 350, currentLevelXp: 50, xpNeededForNextLevel: 300, progressPercent: 16.67 }
 */
export function calculateLevel(totalPoints: number) {
  let level = 1;
  let pointsRequiredForNextLevel = 100; // Points cumulés requis pour atteindre le niveau 2
  let pointsRequiredForCurrentLevel = 0; // Points cumulés au seuil d'entrée du niveau actuel

  // Avancer d'un niveau à chaque fois que le total dépasse le seuil du prochain niveau
  while (totalPoints >= pointsRequiredForNextLevel) {
    level++;
    pointsRequiredForCurrentLevel = pointsRequiredForNextLevel;
    // Chaque niveau suivant coûte N × 100 XP supplémentaires
    pointsRequiredForNextLevel = pointsRequiredForCurrentLevel + level * 100;
  }

  // XP acquise depuis le début du niveau actuel
  const currentLevelXp = totalPoints - pointsRequiredForCurrentLevel;
  // XP totale de la "tranche" du niveau actuel
  const xpNeededForNextLevel = pointsRequiredForNextLevel - pointsRequiredForCurrentLevel;
  // Progression en pourcentage, clampée entre 0 et 100
  const progressPercent = Math.min(100, Math.max(0, (currentLevelXp / xpNeededForNextLevel) * 100));

  return {
    level,
    totalPoints,
    currentLevelXp,
    xpNeededForNextLevel,
    progressPercent,
  };
}
