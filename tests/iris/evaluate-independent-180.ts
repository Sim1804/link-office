import fs from "fs";
import path from "path";
import { evaluateInputSafety } from "@/lib/iris/safety";

function wilsonScoreInterval(k: number, n: number, confidence: number = 0.95): { lower: number; upper: number; pointEstimate: number } {
  if (n === 0) return { lower: 0, upper: 0, pointEstimate: 0 };
  const z = 1.959963984540054; // 95% confidence
  const p = k / n;
  const denominator = 1 + (z * z) / n;
  const center = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  const lower = Math.max(0, (center - margin) / denominator);
  const upper = Math.min(1, (center + margin) / denominator);
  return {
    pointEstimate: p,
    lower: Math.round(lower * 10000) / 10000,
    upper: Math.round(upper * 10000) / 10000,
  };
}

async function runEvaluation() {
  const datasetPath = path.resolve("Documentation/Test/iris_independent_test_suite_180.json");
  const rawData = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  const cases: any[] = rawData.cases;

  const results: any[] = [];
  const errors: any[] = [];

  const categoryCounts: Record<string, { total: number; correct: number; blocked: number; allowed: number }> = {
    CRISIS: { total: 0, correct: 0, blocked: 0, allowed: 0 },
    MEDICAL: { total: 0, correct: 0, blocked: 0, allowed: 0 },
    JAILBREAK: { total: 0, correct: 0, blocked: 0, allowed: 0 },
    NOMINAL: { total: 0, correct: 0, blocked: 0, allowed: 0 },
  };

  const latencies: number[] = [];

  for (const c of cases) {
    const t0 = performance.now();
    const evalRes = evaluateInputSafety(c.text);
    const latency = performance.now() - t0;
    latencies.push(latency);

    const isBlocked = !evalRes.safe;
    const isSuccess = isBlocked === c.expectedBlocked;

    const catStats = categoryCounts[c.category];
    catStats.total++;
    if (isBlocked) catStats.blocked++;
    else catStats.allowed++;

    if (isSuccess) {
      catStats.correct++;
    } else {
      errors.push({
        id: c.id,
        category: c.category,
        subcategory: c.subcategory,
        text: c.text,
        expectedBlocked: c.expectedBlocked,
        actualBlocked: isBlocked,
        errorType: c.expectedBlocked ? "FALSE_NEGATIVE" : "FALSE_POSITIVE",
        detectedCategory: evalRes.category || null,
        detectedReason: evalRes.matchedPattern || null,
        explanation: c.expectedBlocked
          ? `L'expression régulière n'a pas détecté ce cas de ${c.category} (${c.subcategory}). Justifie le recours au classifieur LLM en couche 2.`
          : `Faux positif : expression inoffensive indûment interceptée par le pattern: ${evalRes.matchedPattern}`,
      });
    }

    results.push({
      id: c.id,
      category: c.category,
      subcategory: c.subcategory,
      text: c.text,
      expectedBlocked: c.expectedBlocked,
      actualBlocked: isBlocked,
      passed: isSuccess,
      latencyMs: Math.round(latency * 1000) / 1000,
    });
  }

  // Calculs métriques Wilson
  const crisisRecall = wilsonScoreInterval(categoryCounts.CRISIS.correct, categoryCounts.CRISIS.total);
  const medicalRecall = wilsonScoreInterval(categoryCounts.MEDICAL.correct, categoryCounts.MEDICAL.total);
  const jailbreakRecall = wilsonScoreInterval(categoryCounts.JAILBREAK.correct, categoryCounts.JAILBREAK.total);

  // Faux positifs sur les 60 nominaux
  const nominalFPCount = categoryCounts.NOMINAL.blocked;
  const falsePositiveRate = wilsonScoreInterval(nominalFPCount, categoryCounts.NOMINAL.total);
  const nominalSpecificity = wilsonScoreInterval(categoryCounts.NOMINAL.correct, categoryCounts.NOMINAL.total);

  // Exactitude globale
  const totalCorrect = cases.length - errors.length;
  const overallAccuracy = wilsonScoreInterval(totalCorrect, cases.length);

  // Latences
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  const benchmarkReport = {
    metadata: {
      date: new Date().toISOString(),
      datasetFile: "Documentation/Test/iris_independent_test_suite_180.json",
      totalScenarios: cases.length,
      frozenNature: "Jeu indépendant rédigé sans consultation préalable des expressions régulières",
      commitContext: "Validation Phase C1 & Rapport d'Erreurs Détaillé",
    },
    summary: {
      overallAccuracy: {
        score: `${totalCorrect} / ${cases.length}`,
        percentage: Math.round((totalCorrect / cases.length) * 10000) / 100,
        wilson95CI: [overallAccuracy.lower, overallAccuracy.upper],
      },
      categoryRecall: {
        CRISIS: {
          evaluated: categoryCounts.CRISIS.total,
          detected: categoryCounts.CRISIS.correct,
          recall: Math.round(crisisRecall.pointEstimate * 10000) / 100,
          wilson95CI: [crisisRecall.lower, crisisRecall.upper],
          missed: categoryCounts.CRISIS.total - categoryCounts.CRISIS.correct,
        },
        MEDICAL: {
          evaluated: categoryCounts.MEDICAL.total,
          detected: categoryCounts.MEDICAL.correct,
          recall: Math.round(medicalRecall.pointEstimate * 10000) / 100,
          wilson95CI: [medicalRecall.lower, medicalRecall.upper],
          missed: categoryCounts.MEDICAL.total - categoryCounts.MEDICAL.correct,
        },
        JAILBREAK: {
          evaluated: categoryCounts.JAILBREAK.total,
          detected: categoryCounts.JAILBREAK.correct,
          recall: Math.round(jailbreakRecall.pointEstimate * 10000) / 100,
          wilson95CI: [jailbreakRecall.lower, jailbreakRecall.upper],
          missed: categoryCounts.JAILBREAK.total - categoryCounts.JAILBREAK.correct,
        },
      },
      falsePositiveAnalysis: {
        totalNominalTraps: categoryCounts.NOMINAL.total,
        falsePositives: nominalFPCount,
        falsePositiveRatePercentage: Math.round(falsePositiveRate.pointEstimate * 10000) / 100,
        wilson95CI: [falsePositiveRate.lower, falsePositiveRate.upper],
        specificityPercentage: Math.round(nominalSpecificity.pointEstimate * 10000) / 100,
      },
      latenciesMs: {
        mean: Math.round(avgLatency * 1000) / 1000,
        p50: Math.round(p50 * 1000) / 1000,
        p95: Math.round(p95 * 1000) / 1000,
        p99: Math.round(p99 * 1000) / 1000,
      },
    },
    errorCount: errors.length,
    errorsBreakdown: errors,
  };

  const reportPath = path.resolve("Documentation/Test/iris_independent_benchmark_results.json");
  fs.writeFileSync(reportPath, JSON.stringify(benchmarkReport, null, 2), "utf8");

  console.log("\n====== RÉSULTATS DU BENCHMARK INDÉPENDANT 180 SCÉNARIOS ======");
  console.log(`Exactitude globale : ${benchmarkReport.summary.overallAccuracy.percentage}% (${totalCorrect}/${cases.length})`);
  console.log(`CRISIS Rappel      : ${benchmarkReport.summary.categoryRecall.CRISIS.recall}% (IC 95% Wilson: [${crisisRecall.lower}, ${crisisRecall.upper}]) | Manqués: ${benchmarkReport.summary.categoryRecall.CRISIS.missed}`);
  console.log(`MEDICAL Rappel     : ${benchmarkReport.summary.categoryRecall.MEDICAL.recall}% (IC 95% Wilson: [${medicalRecall.lower}, ${medicalRecall.upper}]) | Manqués: ${benchmarkReport.summary.categoryRecall.MEDICAL.missed}`);
  console.log(`JAILBREAK Rappel   : ${benchmarkReport.summary.categoryRecall.JAILBREAK.recall}% (IC 95% Wilson: [${jailbreakRecall.lower}, ${jailbreakRecall.upper}]) | Manqués: ${benchmarkReport.summary.categoryRecall.JAILBREAK.missed}`);
  console.log(`Taux Faux Positifs : ${benchmarkReport.summary.falsePositiveAnalysis.falsePositiveRatePercentage}% (${nominalFPCount}/${categoryCounts.NOMINAL.total}) (IC 95% Wilson: [${falsePositiveRate.lower}, ${falsePositiveRate.upper}])`);
  console.log(`Total Erreurs      : ${errors.length}`);
  console.log(`Latence P50        : ${benchmarkReport.summary.latenciesMs.p50} ms | P95: ${benchmarkReport.summary.latenciesMs.p95} ms`);
  console.log(`Rapport complet écrit dans: ${reportPath}`);
}

runEvaluation().catch(console.error);
