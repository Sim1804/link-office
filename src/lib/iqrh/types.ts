/**
 * @file types.ts
 * @module lib/iqrh
 * @description Définit l'ensemble des types, interfaces et constantes fondamentaux
 * utilisés par le moteur IQRH (Indice de Qualité des Relations Humaines).
 *
 * Ce fichier constitue le "contrat de données" partagé entre :
 * - Les services de calcul (calculation-service, icr-calculation-service, profile-calculation-service)
 * - Les composants d'affichage du dashboard (RadarChart, DimensionsList, WeatherCard)
 * - L'API de résultats
 *
 * @see lib/iqrh/calculation-service.ts — Moteur principal de calcul des scores IQRH
 * @see lib/iqrh/result-service.ts — Orchestrateur de la soumission complète
 */

// ─────────────────────────────────────────────────────────────────────────────
// DIMENSIONS RELATIONNELLES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tuple immuable des 5 dimensions relationnelles évaluées par l'IQRH.
 * L'ordre est significatif : il correspond à l'ordre d'affichage dans le rapport.
 *
 * - SOCIAL       : Qualité du réseau social (amis, communauté, appartenance)
 * - AFFECTIVE    : Qualité des liens affectifs proches (famille, amis intimes)
 * - SENTIMENTAL  : Qualité de la vie sentimentale/amoureuse
 * - PROFESSIONAL : Satisfaction et engagement dans la vie professionnelle
 * - SELF         : Relation à soi-même, sens, spiritualité, estime de soi
 */
export const DIMENSIONS = ["SOCIAL", "AFFECTIVE", "SENTIMENTAL", "PROFESSIONAL", "SELF"] as const;

/**
 * Type union dérivé du tuple DIMENSIONS.
 * Garantit que toute valeur de dimension est bien l'une des 5 valeurs définies.
 * @example "SOCIAL" | "AFFECTIVE" | "SENTIMENTAL" | "PROFESSIONAL" | "SELF"
 */
export type IqrhDimension = typeof DIMENSIONS[number];

// ─────────────────────────────────────────────────────────────────────────────
// NIVEAUX DE DIMENSION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clés identifiant les 4 niveaux qualitatifs possibles pour une dimension.
 * Déterminé par le score de la dimension (voir `getDimensionStatusInfo`).
 *
 * - "resource"    : Score ≥ 80 → La dimension est une force/ressource
 * - "satisfactory": Score ≥ 60 → La dimension est en bon état
 * - "fragile"     : Score ≥ 40 → La dimension montre des signes de fragilité
 * - "priority"    : Score  < 40 → La dimension est prioritaire à traiter
 */
export type DimensionLevelKey = "resource" | "satisfactory" | "fragile" | "priority";

/**
 * Configuration visuelle et sémantique associée à un niveau de dimension.
 * Utilisée par les composants UI pour afficher la couleur, l'icône et le libellé adaptés.
 */
export interface DimensionStatusConfig {
  /** Clé du niveau (permet d'identifier le niveau programmatiquement) */
  levelKey: DimensionLevelKey;
  /** Libellé court du niveau affiché dans le rapport (ex: "Ressource solide") */
  levelLabel: string;
  /** Conseil d'action associé (ex: "À préserver", "À consolider") */
  statusLabel: string;
  /** Emoji représentant visuellement le niveau */
  icon: string;
  /** Couleur CSS principale pour le texte et les éléments graphiques */
  color: string;
  /** Couleur de fond semi-transparente pour les cartes */
  bg: string;
  /** Couleur de la bordure semi-transparente */
  border: string;
  /** Dégradé CSS pour les barres de progression */
  gradient: string;
}

/**
 * Registre complet des configurations visuelles pour chaque niveau de dimension.
 * Indexé par `DimensionLevelKey` pour un accès direct en O(1).
 *
 * @example
 * const config = DIMENSION_STATUSES["resource"];
 * // { levelLabel: "Ressource solide", color: "#10b981", ... }
 */
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
    statusLabel: "Priorité d'action",
    icon: "🔴",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.3)",
    gradient: "linear-gradient(90deg, #ef4444, #dc2626)",
  },
};

/**
 * Détermine le niveau qualitatif d'une dimension à partir de son score numérique.
 *
 * Seuils appliqués (selon le référentiel IQRH) :
 * - 80–100 → "resource"     (Force/Ressource)
 * - 60–79  → "satisfactory" (Satisfaisant)
 * - 40–59  → "fragile"      (Fragilité modérée)
 * -  0–39  → "priority"     (Fragilité importante, prioritaire)
 *
 * @param score - Score numérique de la dimension (0 à 100)
 * @returns La configuration complète (couleur, libellé, icône) associée au niveau
 */
export function getDimensionStatusInfo(score: number): DimensionStatusConfig {
  if (score >= 80) return DIMENSION_STATUSES.resource;
  if (score >= 60) return DIMENSION_STATUSES.satisfactory;
  if (score >= 40) return DIMENSION_STATUSES.fragile;
  return DIMENSION_STATUSES.priority;
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES DE RÉSULTATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score calculé pour une dimension individuelle de l'IQRH.
 * Produit par `IQRHCalculationService.calculate()`.
 */
export interface DimensionScore {
  /** Identifiant de la dimension (ex: "SOCIAL") */
  dimension: IqrhDimension;
  /** Libellé lisible par l'humain (ex: "Relations sociales") */
  label: string;
  /** Score de 0 à 100 */
  score: number;
  /** Niveau qualitatif déterminé par le score */
  level: DimensionLevelKey;
}

/**
 * Point de données pour le graphique Radar du dashboard.
 * Format attendu par la librairie Recharts.
 */
export interface RadarData {
  /** Libellé affiché sur l'axe du radar (ex: "Social") */
  dimension: string;
  /** Valeur de 0 à 100 */
  score: number;
}

/**
 * Texte structuré du référentiel IQRH pour une force ou un point de vigilance.
 * Chaque dimension possède un texte d'interprétation et de levier spécifique.
 */
export interface ResultText {
  /** Dimension concernée */
  dimension: IqrhDimension;
  /** Titre court de la force ou du point de vigilance */
  title: string;
  /** Paragraphe d'interprétation psychologique */
  interpretation: string;
  /** Conseil de levier pratique proposé à l'utilisateur */
  lever: string;
}

/**
 * Résultat IQRH complet calculé par `IQRHCalculationService.calculate()`.
 * Représente le rapport intermédiaire avant persistance en base de données.
 * Ce type est utilisé en mémoire uniquement — la persistance est gérée par `ResultService`.
 */
export interface ResultatIQRH {
  /** Score global de qualité relationnelle (moyenne pondérée des 5 dimensions, 0–100) */
  globalScore: number;
  /** Scores détaillés pour chacune des 5 dimensions */
  dimensions: DimensionScore[];
  /** Météo relationnelle — métaphore visuelle du niveau de bien-être global */
  weather: "Tempête" | "Orage" | "Ciel couvert" | "Éclaircies" | "Grand soleil";
  /** Indice d'Équilibre Relationnel (IER) : mesure l'homogénéité des scores (0–100) */
  balanceIndex: number;
  /** Dimension avec le score le plus faible — détermine le thème de l'ordonnance */
  priorityDimension: IqrhDimension;
  /** Titres des 2–3 dimensions les plus élevées (forces) */
  strengths: string[];
  /** Titres des 1–2 dimensions les plus faibles (points de vigilance) */
  watchpoints: string[];
  /** Textes complets des forces (interprétation + levier) */
  strengthDetails: ResultText[];
  /** Textes complets des points de vigilance (interprétation + levier) */
  watchpointDetails: ResultText[];
  /** Détails pour les 5 dimensions (texte premium/freemium) */
  dimensionDetails: { dimension: string, score: number, shortText: string, longText: string }[];
  /** Nom du profil relationnel principal (ex: "Le Connecteur") */
  primaryProfile: string;
  /** Nom du profil relationnel secondaire (ex: "Le Bâtisseur") */
  secondaryProfile: string;
  /** Résumé du profil pour affichage (ex: "Le Connecteur — Connecteur-Bâtisseur") */
  profileSummary: string;
  /** Données formatées pour le graphique Radar du dashboard */
  radar: RadarData[];
  /** Niveau qualitatif de l'IER (ex: "Équilibre global satisfaisant") */
  balanceLevel: string;
  /** Interprétation courte de l'IER (Freemium) */
  balanceInterpretation: string;
  /** Interprétation longue de l'IER (Premium) */
  balanceInterpretationPremium: string;
  /** Phrase de résumé du radar */
  radarSummary: string;
}
