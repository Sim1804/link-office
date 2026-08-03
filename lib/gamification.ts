/**
 * Gamification Utilities
 */

/**
 * Calcule le niveau et l'XP d'un utilisateur à partir de ses points totaux.
 * Formule choisie (exemple) :
 * Niveau 1 = 0 à 99 pts
 * Niveau 2 = 100 à 299 pts
 * Niveau 3 = 300 à 599 pts
 * Niveau N = (N-1) * (N) / 2 * 100
 */
export function calculateLevel(totalPoints: number) {
  let level = 1;
  let pointsForNextLevel = 100;
  let pointsForCurrentLevel = 0;

  while (totalPoints >= pointsForNextLevel) {
    level++;
    pointsForCurrentLevel = pointsForNextLevel;
    pointsForNextLevel = pointsForCurrentLevel + level * 100;
  }

  const currentLevelXp = totalPoints - pointsForCurrentLevel;
  const xpNeededForNextLevel = pointsForNextLevel - pointsForCurrentLevel;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelXp / xpNeededForNextLevel) * 100));

  return {
    level,
    totalPoints,
    currentLevelXp,
    xpNeededForNextLevel,
    progressPercent,
  };
}
