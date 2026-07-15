export const DIMENSIONS = ["SOCIAL", "AFFECTIVE", "SENTIMENTAL", "PROFESSIONAL", "SELF"] as const;
export type IqrhDimension = typeof DIMENSIONS[number];

export interface DimensionScore {
  dimension: IqrhDimension;
  label: string;
  score: number;
  level: "resource" | "satisfactory" | "fragile" | "priority";
}

export interface RadarData { dimension: string; score: number; }

/** Structured wording required by the IQRH référentiel for a strength or watchpoint. */
export interface ResultText {
  dimension: IqrhDimension;
  title: string;
  interpretation: string;
  orientation: string;
}

export interface ResultatIQRH {
  globalScore: number;
  dimensions: DimensionScore[];
  weather: "Tempête" | "Orage" | "Ciel couvert" | "Éclaircies" | "Grand soleil";
  balanceIndex: number;
  priorityDimension: IqrhDimension;
  strengths: string[];
  watchpoints: string[];
  strengthDetails: ResultText[];
  watchpointDetails: ResultText[];
  primaryProfile: string;
  secondaryProfile: string;
  profileSummary: string;
  radar: RadarData[];
}
