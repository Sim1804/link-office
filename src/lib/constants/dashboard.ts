/**
 * @module dashboard-constants
 * Constantes partagées entre les dashboards B2B (RH), B2B2C (Mutuelles)
 * et Collectivités. Centralise les labels, couleurs et icônes pour éviter
 * la duplication et garantir la cohérence visuelle.
 */

/** Labels lisibles pour chaque dimension IQRH (clé = champ Prisma) */
export const DIMENSION_LABELS: Record<string, string> = {
  social:       "Relations sociales",
  affective:    "Relations affectives",
  sentimental:  "Vie sentimentale",
  professional: "Vie pro & engagement",
  self:         "Relation à soi",
};

/** Couleurs ICR dans l'ordre croissant de criticité */
export const ICR_COLORS = ["#34d399", "#f59e0b", "#f97316", "#f43f5e"] as const;

/** Icônes météo associées aux labels de l'IqrhResult */
export const WEATHER_ICONS: Record<string, string> = {
  "Grand soleil": "☀️",
  "Éclaircies":   "⛅",
  "Ciel couvert": "☁️",
  "Orage":        "🌩️",
  "Tempête":      "⛈️",
};

/**
 * Construit le tableau de données pour le PieChart ICR à partir
 * de la distribution renvoyée par l'API.
 */
export function buildIcrData(
  distribution: { faible: number; modere: number; eleve: number; critique: number }
) {
  return [
    { name: "Faible",   value: distribution.faible,   color: ICR_COLORS[0] },
    { name: "Modéré",   value: distribution.modere,   color: ICR_COLORS[1] },
    { name: "Élevé",    value: distribution.eleve,    color: ICR_COLORS[2] },
    { name: "Critique", value: distribution.critique, color: ICR_COLORS[3] },
  ].filter((d) => d.value > 0);
}

/**
 * Construit le tableau de données pour le RadarChart IQRH à partir
 * des moyennes renvoyées par l'API.
 */
export function buildRadarData(averages: Record<string, number>) {
  return Object.entries(DIMENSION_LABELS).map(([key, name]) => ({
    dimension: name,
    score: averages[key] ?? 0,
    fullMark: 100,
  }));
}

/**
 * Construit le tableau de données pour le BarChart météo, trié par
 * nombre décroissant.
 */
export function buildWeatherData(
  distribution: Record<string, number>,
  withIcon = true
) {
  return Object.entries(distribution)
    .map(([label, count]) => ({
      label: withIcon ? `${WEATHER_ICONS[label] ?? "🌡️"} ${label}` : label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Retourne la couleur correspondant à un score IQRH global.
 * ≥ 80 → vert, ≥ 60 → violet, ≥ 40 → orange, < 40 → rouge
 */
export function scoreToColor(score: number): string {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#a78bfa";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

/** Style commun des tooltips Recharts */
export const RECHARTS_TOOLTIP_STYLE = {
  background: "#111827",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  fontSize: 13,
} as const;
