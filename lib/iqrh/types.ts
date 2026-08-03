export const DIMENSIONS = ["SOCIAL", "AFFECTIVE", "SENTIMENTAL", "PROFESSIONAL", "SELF"] as const;
export type IqrhDimension = typeof DIMENSIONS[number];

export type DimensionLevelKey = "resource" | "satisfactory" | "fragile" | "priority";

export interface DimensionStatusConfig {
  levelKey: DimensionLevelKey;
  levelLabel: string;
  statusLabel: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  gradient: string;
}

export const DIMENSION_STATUSES: Record<DimensionLevelKey, DimensionStatusConfig> = {
  resource: {
    levelKey: "resource",
    levelLabel: "Ressource solide",
    statusLabel: "À préserver",
    icon: "🟢",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.3)",
    gradient: "linear-gradient(90deg, #10b981, #059669)",
  },
  satisfactory: {
    levelKey: "satisfactory",
    levelLabel: "Équilibre satisfaisant",
    statusLabel: "À consolider",
    icon: "🔵",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.3)",
    gradient: "linear-gradient(90deg, #3b82f6, #0284c7)",
  },
  fragile: {
    levelKey: "fragile",
    levelLabel: "Fragilité modérée",
    statusLabel: "À renforcer",
    icon: "🟠",
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.15)",
    border: "rgba(249, 115, 22, 0.3)",
    gradient: "linear-gradient(90deg, #f97316, #d97706)",
  },
  priority: {
    levelKey: "priority",
    levelLabel: "Fragilité importante",
    statusLabel: "Priorité d’action",
    icon: "🔴",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.3)",
    gradient: "linear-gradient(90deg, #ef4444, #dc2626)",
  },
};

export function getDimensionStatusInfo(score: number): DimensionStatusConfig {
  if (score >= 80) return DIMENSION_STATUSES.resource;
  if (score >= 60) return DIMENSION_STATUSES.satisfactory;
  if (score >= 40) return DIMENSION_STATUSES.fragile;
  return DIMENSION_STATUSES.priority;
}

export interface DimensionScore {
  dimension: IqrhDimension;
  label: string;
  score: number;
  level: DimensionLevelKey;
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


