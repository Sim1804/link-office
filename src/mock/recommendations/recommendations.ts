import { Dimension, getMockResult } from "../iqrh";
import { mockUsers } from "../users";

export enum RecommendationCategory { Community = "community", Support = "support", Couple = "couple", Work = "work", Wellbeing = "wellbeing" }
export interface Recommendation { id: string; userId: string; title: string; description: string; category: RecommendationCategory; dimension: Dimension; priority: 1 | 2 | 3; }
const catalog: Record<Dimension, readonly [string, string, RecommendationCategory][]> = {
  [Dimension.RelationsSociales]: [["Rejoindre un collectif local", "Planifiez une première activité de quartier cette semaine.", RecommendationCategory.Community], ["Réactiver un lien", "Envoyez un message à une personne de confiance.", RecommendationCategory.Support]],
  [Dimension.RelationsAffectives]: [["Créer un temps d'écoute", "Proposez un échange sans écran avec une personne importante.", RecommendationCategory.Support], ["Exprimer un besoin", "Formulez simplement ce dont vous auriez besoin cette semaine.", RecommendationCategory.Wellbeing]],
  [Dimension.VieSentimentale]: [["Clarifier vos attentes", "Prenez un moment pour identifier une attente relationnelle réaliste.", RecommendationCategory.Couple], ["Nourrir un lien important", "Prévoyez un temps de qualité avec une personne choisie.", RecommendationCategory.Couple]],
  [Dimension.VieProfessionnelle]: [["Demander un échange", "Planifiez un point constructif avec un collègue ou référent.", RecommendationCategory.Work], ["Renforcer votre réseau", "Participez à un échange professionnel ou associatif.", RecommendationCategory.Work]],
  [Dimension.RelationASoi]: [["Poser une limite saine", "Identifiez une limite qui protégerait votre énergie cette semaine.", RecommendationCategory.Wellbeing], ["Pratiquer l'auto-compassion", "Notez une réussite relationnelle récente sans la minimiser.", RecommendationCategory.Wellbeing]],
};
export const mockRecommendations: readonly Recommendation[] = mockUsers.flatMap((user) => { const result = getMockResult(user.id)!; const weakest = [...result.dimensions].sort((a, b) => a.score - b.score).map((item) => item.dimension); return Array.from({ length: 5 }, (_, index) => { const dimension = weakest[index % weakest.length]!; const item = catalog[dimension][index % catalog[dimension].length]!; return { id: `rec_${user.id}_${index + 1}`, userId: user.id, title: item[0], description: item[1], category: item[2], dimension, priority: (index < 2 ? 1 : index < 4 ? 2 : 3) as 1 | 2 | 3 }; }); });
export const getMockRecommendations = (userId: string): readonly Recommendation[] => mockRecommendations.filter((item) => item.userId === userId);
