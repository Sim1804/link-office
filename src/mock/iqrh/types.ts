export enum Dimension {
  RelationsSociales = "relationsSociales",
  RelationsAffectives = "relationsAffectives",
  VieSentimentale = "vieSentimentale",
  VieProfessionnelle = "vieProfessionnelle",
  RelationASoi = "relationASoi",
}

export enum IqrhWeather {
  Tempete = "tempête",
  Orage = "orage",
  CielCouvert = "ciel couvert",
  Eclaircies = "éclaircies",
  GrandSoleil = "grand soleil",
}

export enum RelationalProfile {
  EnRetrait = "en retrait",
  EnTransition = "en transition",
  Equilibriste = "équilibriste",
  Connecteur = "connecteur",
  Ressource = "ressource",
}

export interface DimensionScore {
  dimension: Dimension;
  label: string;
  score: number;
  trend: "up" | "stable" | "down";
}

export interface ResultatIQRH {
  userId: string;
  score: number;
  dimensions: readonly DimensionScore[];
  weather: IqrhWeather;
  profile: RelationalProfile;
  secondaryProfile: RelationalProfile;
  strengths: readonly string[];
  watchpoints: readonly string[];
  assessedAt: string;
}
