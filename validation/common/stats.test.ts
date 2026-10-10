import { describe, it, expect } from "vitest";
import { wilsonScoreInterval, bootstrapPercentile, calculatePercentile } from "./stats";

describe("Validation Commune : Module Statistiques Certifié", () => {
  describe("Intervalle de Wilson (95%) — Valeurs de Contrôle Formelles", () => {
    it("Contrôle 1 : 12 / 60 donne [0.1183, 0.3178]", () => {
      const res = wilsonScoreInterval(12, 60, 0.95);
      expect(res.proportion).toBeCloseTo(0.2, 4);
      expect(res.lower).toBeCloseTo(0.1183, 4);
      expect(res.upper).toBeCloseTo(0.3178, 4);
    });

    it("Contrôle 2 : 0 / 60 donne une borne haute proche de 0.0600 (0.0602)", () => {
      const res = wilsonScoreInterval(0, 60, 0.95);
      expect(res.lower).toBe(0);
      expect(res.upper).toBeCloseTo(0.0600, 2);
      expect(Math.abs(res.upper - 0.0600)).toBeLessThan(0.001);
    });

    it("Contrôle 3 : 59 / 60 donne une borne basse >= 0.90", () => {
      const res = wilsonScoreInterval(59, 60, 0.95);
      expect(res.lower).toBeGreaterThanOrEqual(0.90);
      expect(res.upper).toBeLessThanOrEqual(1.0);
    });

    it("Propriétés aux limites : 60 / 60 et erreurs sur entrées invalides", () => {
      const full = wilsonScoreInterval(60, 60, 0.95);
      expect(full.upper).toBe(1);
      expect(full.lower).toBeGreaterThan(0.9);

      expect(() => wilsonScoreInterval(-1, 60)).toThrow();
      expect(() => wilsonScoreInterval(61, 60)).toThrow();
    });
  });

  describe("Percentiles et Bootstrap Percentile", () => {
    it("Calcul de percentiles empiriques P50, P90, P95, P99", () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      expect(calculatePercentile(values, 50)).toBe(55);
      expect(calculatePercentile(values, 0)).toBe(10);
      expect(calculatePercentile(values, 100)).toBe(100);
    });

    it("Bootstrap percentile est reproductible avec la graine fixée (>= 1000 tirages)", () => {
      const data = [1.2, 1.5, 1.1, 1.8, 2.0, 1.4, 1.3, 1.9, 1.6, 1.5, 2.2, 1.7];
      const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

      const run1 = bootstrapPercentile(data, mean, 1000, 42, 0.95);
      const run2 = bootstrapPercentile(data, mean, 1000, 42, 0.95);

      expect(run1.observed).toBe(run2.observed);
      expect(run1.lower).toBe(run2.lower);
      expect(run1.upper).toBe(run2.upper);
      expect(run1.resamples).toBe(1000);
      expect(run1.lower).toBeLessThan(run1.observed);
      expect(run1.upper).toBeGreaterThan(run1.observed);
    });
  });
});
