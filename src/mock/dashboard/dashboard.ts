import { mockUsers } from "../users";

export interface DashboardData {
  userId: string;
  iqrh: {
    score_global: number;
    best_dimension: string;
    priority_dimension: string;
    weather: {
      icon: string;
      label: string;
      title: string;
      text: string;
    };
    ier_score: number;
    ier_level: string;
    radar: {
      relations_sociales: number;
      relations_affectives: number;
      vie_sentimentale: number;
      vie_professionnelle_engagement: number;
      relation_a_soi_sens: number;
    };
    dimensions: Array<{
      code: string;
      nom: string;
      score: number;
    }>;
  };
  icr: {
    icr_score: number;
    niveau_icr: string;
    family_complexity: number;
    professional_complexity: number;
    transition_complexity: number;
    relational_load: number;
    protective_resources: number;
  };
  profil: {
    profile_primary: string;
    profile_secondary: string;
    profile_description: string;
  };
}

export const mockDashboards: readonly DashboardData[] = mockUsers.map((user) => {
  return {
    userId: user.id,
    iqrh: {
      score_global: 72,
      best_dimension: "Relations sociales",
      priority_dimension: "Vie sentimentale",
      weather: {
        icon: "⛅",
        label: "Éclaircies",
        title: "Bonne qualité relationnelle",
        text: "Votre météo est globalement positive avec quelques nuages."
      },
      ier_score: 65,
      ier_level: "Modéré",
      radar: {
        relations_sociales: 80,
        relations_affectives: 70,
        vie_sentimentale: 55,
        vie_professionnelle_engagement: 85,
        relation_a_soi_sens: 70
      },
      dimensions: [
        { code: "D1", nom: "Relations sociales", score: 80 },
        { code: "D2", nom: "Relations affectives", score: 70 },
        { code: "D3", nom: "Vie sentimentale", score: 55 },
        { code: "D4", nom: "Vie professionnelle", score: 85 },
        { code: "D5", nom: "Relation à soi", score: 70 },
      ]
    },
    icr: {
      icr_score: 45,
      niveau_icr: "Complexe",
      family_complexity: 12,
      professional_complexity: 8,
      transition_complexity: 15,
      relational_load: 10,
      protective_resources: 20
    },
    profil: {
      profile_primary: "L'Architecte Relationnel",
      profile_secondary: "L'Explorateur",
      profile_description: "Vous construisez vos relations sur des bases solides tout en gardant une ouverture au changement."
    }
  };
});

export const getMockDashboard = (userId: string): DashboardData | undefined => mockDashboards.find((item) => item.userId === userId);
