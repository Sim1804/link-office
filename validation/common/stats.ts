/**
 * @file stats.ts
 * @module validation/common/stats
 * @description Fonctions statistiques certifiées pour le protocole de validation :
 * - Intervalle de Wilson (95%) pour proportions binomiales
 * - Bootstrap percentile (>= 1000 tirages avec graine pseudo-aléatoire fixée)
 * - Calculs de percentiles empiriques (P50, P90, P95, P99)
 */

export interface WilsonInterval {
  proportion: number;
  lower: number;
  upper: number;
  successes: number;
  total: number;
  confidence: number;
}

export interface BootstrapResult {
  observed: number;
  lower: number;
  upper: number;
  resamples: number;
  seed: number;
  confidence: number;
}

/**
 * Générateur pseudo-aléatoire déterministe (Mulberry32)
 */
export function createRng(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Calcule l'intervalle de score de Wilson pour une proportion binomiale.
 *
 * @param successes Nombre de succès (entier >= 0)
 * @param total Nombre total d'essais (entier > 0)
 * @param confidence Niveau de confiance (défaut 0.95 -> z = 1.95996398454)
 */
export function wilsonScoreInterval(
  successes: number,
  total: number,
  confidence: number = 0.95
): WilsonInterval {
  if (total <= 0) {
    return { proportion: 0, lower: 0, upper: 0, successes, total, confidence };
  }
  if (successes < 0 || successes > total) {
    throw new Error(`Nombre de succès invalide : ${successes} pour total ${total}`);
  }

  const p = successes / total;

  // Calcul du quantile z correspondant au niveau de confiance
  // Pour 0.95 standard, z = 1.959963984540054
  let z = 1.959963984540054;
  if (confidence === 0.90) z = 1.6448536269514722;
  else if (confidence === 0.99) z = 2.5758293035489004;

  const z2 = z * z;
  const denominator = 1 + z2 / total;
  const center = p + z2 / (2 * total);
  const margin = z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total));

  const lower = successes === 0 ? 0 : Math.max(0, (center - margin) / denominator);
  const upper = successes === total ? 1 : Math.min(1, (center + margin) / denominator);

  return {
    proportion: p,
    lower,
    upper,
    successes,
    total,
    confidence,
  };
}

/**
 * Calcule un percentile empirique sur une série de nombres triée ou non triée.
 * Utilise l'interpolation linéaire type 7 (standard R / Python numpy).
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const sorted = [...values].sort((a, b) => a - b);
  const q = Math.max(0, Math.min(100, percentile)) / 100;
  const idx = (sorted.length - 1) * q;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);

  if (lo === hi) return sorted[lo];
  const weight = idx - lo;
  return sorted[lo] * (1 - weight) + sorted[hi] * weight;
}

/**
 * Calcule l'intervalle de confiance bootstrap percentile pour une statistique donnée.
 *
 * @param data Tableau de nombres observés
 * @param statFn Fonction calculant la statistique scalaire sur un échantillon
 * @param resamples Nombre de rééchantillonnages (>= 1000)
 * @param seed Graine du générateur pseudo-aléatoire
 * @param confidence Niveau de confiance (défaut 0.95)
 */
export function bootstrapPercentile(
  data: number[],
  statFn: (sample: number[]) => number,
  resamples: number = 1000,
  seed: number = 42,
  confidence: number = 0.95
): BootstrapResult {
  if (data.length === 0) {
    return { observed: 0, lower: 0, upper: 0, resamples, seed, confidence };
  }

  const observed = statFn(data);
  const rng = createRng(seed);
  const n = data.length;
  const bootstrappedStats: number[] = new Array(resamples);

  for (let b = 0; b < resamples; b++) {
    const sample = new Array(n);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(rng() * n);
      sample[i] = data[idx];
    }
    bootstrappedStats[b] = statFn(sample);
  }

  bootstrappedStats.sort((a, b) => a - b);

  const alpha = 1 - confidence;
  const lowerPercentile = (alpha / 2) * 100;
  const upperPercentile = (1 - alpha / 2) * 100;

  const lower = calculatePercentile(bootstrappedStats, lowerPercentile);
  const upper = calculatePercentile(bootstrappedStats, upperPercentile);

  return {
    observed,
    lower,
    upper,
    resamples,
    seed,
    confidence,
  };
}
