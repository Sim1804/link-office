export const DIMENSIONS = ["SOCIAL", "AFFECTIVE", "SENTIMENTAL", "PROFESSIONAL", "SELF"] as const;
export type IqrhDimension = typeof DIMENSIONS[number];
export interface DimensionScore { dimension: IqrhDimension; label: string; score: number; level: "resource" | "satisfactory" | "fragile" | "priority"; }
export interface RadarData { dimension: string; score: number; }
export interface ResultatIQRH { globalScore: number; dimensions: DimensionScore[]; weather: "Tempête" | "Orage" | "Ciel couvert" | "Éclaircies" | "Grand soleil"; balanceIndex: number; priorityDimension: IqrhDimension; strengths: string[]; watchpoints: string[]; primaryProfile: string; secondaryProfile: string; profileSummary: string; radar: RadarData[]; }
