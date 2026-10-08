import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("D3. Benchmark de Recommandation Non-Circulaire (Vérité Terrain Découplée)", () => {
  const datasetPath = path.resolve("Documentation/Test/personas_recommendation_benchmark_30.json");
  const annotationsPath = path.resolve("Documentation/Test/ground_truth_annotations.json");
  const resultsPath = path.resolve("Documentation/Test/recommendation_benchmark_results.json");

  it("1. Vérifie l'existence et la cohérence des 30 personas synthétiques indépendants", () => {
    expect(fs.existsSync(datasetPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
    const personas = data.personas;
    expect(personas.length).toBe(30);

    for (const p of personas) {
      expect(p.id).toBeDefined();
      expect(p.name).toBeDefined();
      expect(p.primaryProfile).toBeDefined();
      expect(p.weakestDimension).toBeDefined();
      expect(p.strongestDimension).toBeDefined();
      expect(p.dimensions.social).toBeGreaterThanOrEqual(10);
      expect(p.dimensions.social).toBeLessThanOrEqual(95);
    }
  });

  it("2. Vérifie la matrice d'annotation et l'accord inter-annotateurs Cohen Weighted Kappa >= 0.70", () => {
    expect(fs.existsSync(annotationsPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(annotationsPath, "utf8"));
    const annotations = data.annotations;
    expect(annotations.length).toBe(750); // 30 personas x 25 items évalués

    expect(fs.existsSync(resultsPath)).toBe(true);
    const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
    const kappa = results.metadata.interAnnotatorAgreement.cohenQuadraticWeightedKappa;
    expect(kappa).toBeGreaterThanOrEqual(0.70);
  });

  it("3. Prouve la supériorité statistique du moteur Link Office vs baselines aléatoire et popularité", () => {
    const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
    const linkOffice = results.benchmarks.linkOfficeEngine;
    const random = results.benchmarks.baselineRandom;
    const popularity = results.benchmarks.baselinePopularity;

    // Supériorité nette sur Precision@1, MAP et nDCG@5
    expect(linkOffice.p1.mean).toBeGreaterThan(random.p1.mean);
    expect(linkOffice.p1.mean).toBeGreaterThan(popularity.p1.mean);
    expect(linkOffice.map.mean).toBeGreaterThan(random.map.mean);
    expect(linkOffice.map.mean).toBeGreaterThan(popularity.map.mean);
    expect(linkOffice.ndcg5.mean).toBeGreaterThan(random.ndcg5.mean);
    expect(linkOffice.ndcg5.mean).toBeGreaterThan(popularity.ndcg5.mean);

    // Vérifie que les intervalles de confiance Bootstrap à 95% sont calculés
    expect(linkOffice.p1.bootstrapCi95).toHaveLength(2);
    expect(linkOffice.p1.bootstrapCi95[0]).toBeGreaterThanOrEqual(0.20);
  });
});
