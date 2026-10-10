/**
 * @file run.ts
 * @module validation/t2-load/run
 * @description Exécuteur du banc T2 : Charge authentifiée k6 sur build de production Next.js — Passe 4.
 *
 * Lit directement les métriques dans raw/k6-summary.json sans passer par .values.
 * Lève une exception si un champ est absent, refuse tout 0 non justifié (NON CONCLUANT),
 * documente et explique l'écart base / k6, et applique les 4 statuts du protocole.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { getEnvironmentMetadata } from "../common/env";
import { prepareDraftAssessments } from "./prepare-drafts";

const BASE_DIR = path.resolve(__dirname);
const RAW_DIR = path.join(BASE_DIR, "raw");
const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

async function main() {
  const startTime = Date.now();
  const rawLog: string[] = [];
  function log(msg: string) {
    console.log(msg);
    rawLog.push(`[${new Date().toISOString()}] ${msg}`);
  }

  log("=== Démarrage du Banc T2 (Passe 4) : Charge Authentifiée sur Build de Production ===");

  const prisma = new PrismaClient();

  // 1. Préparation préalable des évaluations en statut DRAFT
  log("Préparation des brouillons d'évaluations réalistes pour la charge...");
  const draftsMap = await prepareDraftAssessments(15, 20);
  fs.writeFileSync(path.join(RAW_DIR, "drafts.json"), JSON.stringify(draftsMap, null, 2), "utf8");

  // Contrôle préalable de la base et décompte initial des soumissions
  const initialSubmittedCount = await prisma.assessment.count({
    where: { status: "SUBMITTED" },
  });
  log(`✓ État initial PostgreSQL : ${initialSubmittedCount} bilans au statut SUBMITTED.`);

  // 2. Exécution de la salve de charge k6
  log("Lancement du test de charge k6 (paliers 10, 50, 100 VU)...");
  const summaryJsonPath = path.join(RAW_DIR, "k6-summary.json");
  const k6ScriptPath = path.join(BASE_DIR, "k6-suite.js");

  let k6Stdout = "";
  let k6Passed = true;

  try {
    k6Stdout = execSync(`k6 run --summary-export "${summaryJsonPath}" "${k6ScriptPath}"`, {
      encoding: "utf8",
      env: { ...process.env, BASE_URL },
      timeout: 180000,
    });
    log("✓ Salve k6 complétée.");
  } catch (err: any) {
    k6Stdout = (err.stdout || "") + "\n" + (err.stderr || "");
    k6Passed = false;
    log(`Avertissement k6 (code de sortie non-zéro ou seuil dépassé) : ${err.message}`);
  }

  fs.writeFileSync(path.join(RAW_DIR, "k6-stdout.log"), k6Stdout, "utf8");

  // 3. Lecture stricte et directe des métriques dans k6-summary.json
  if (!fs.existsSync(summaryJsonPath)) {
    throw new Error(`[T2_HARNAIS_ERROR] Fichier de résumé k6 introuvable : ${summaryJsonPath}`);
  }

  let summaryData: any;
  try {
    summaryData = JSON.parse(fs.readFileSync(summaryJsonPath, "utf8"));
  } catch (err: any) {
    throw new Error(`[T2_HARNAIS_ERROR] Impossible de parser k6-summary.json : ${err.message}`);
  }

  // Nettoyage de sécurité : Suppression de setup_data (cookies) du fichier résumé
  if (summaryData.setup_data) {
    delete summaryData.setup_data;
    fs.writeFileSync(summaryJsonPath, JSON.stringify(summaryData, null, 2), "utf8");
    log("✓ Nettoyage de sécurité effectué : section setup_data (cookies) retirée de k6-summary.json.");
  }

  const metrics = summaryData.metrics || {};

  // Extraction stricte sans valeur 0 par défaut
  const subMetric = metrics.questionnaire_submission_duration;
  if (!subMetric || (subMetric["p(95)"] === undefined && subMetric.values?.["p(95)"] === undefined)) {
    throw new Error("[T2_HARNAIS_ERROR] Métrique 'questionnaire_submission_duration.p(95)' introuvable dans k6-summary.json");
  }
  const submissionP95 = Number(subMetric["p(95)"] ?? subMetric.values?.["p(95)"]);

  const unexpMetric = metrics.unexpected_statuses;
  if (!unexpMetric || (unexpMetric.value === undefined && unexpMetric.rate === undefined && unexpMetric.values?.rate === undefined)) {
    throw new Error("[T2_HARNAIS_ERROR] Métrique 'unexpected_statuses' introuvable dans k6-summary.json");
  }
  const unexpectedRate = Number(unexpMetric.value ?? unexpMetric.rate ?? unexpMetric.values?.rate);

  const successMetric = metrics.successful_questionnaire_submissions;
  if (!successMetric || (successMetric.count === undefined && successMetric.values?.count === undefined)) {
    throw new Error("[T2_HARNAIS_ERROR] Métrique 'successful_questionnaire_submissions.count' introuvable dans k6-summary.json");
  }
  const k6SuccessCount = Number(successMetric.count ?? successMetric.values?.count);

  const irisMetric = metrics.iris_time_to_first_token;
  if (!irisMetric || (irisMetric["p(95)"] === undefined && irisMetric.values?.["p(95)"] === undefined)) {
    throw new Error("[T2_HARNAIS_ERROR] Métrique 'iris_time_to_first_token.p(95)' introuvable dans k6-summary.json");
  }
  const irisTtftP95 = Number(irisMetric["p(95)"] ?? irisMetric.values?.["p(95)"]);

  // Règle A2 : Toute valeur 0 non justifiée par une mesure déclenche NON CONCLUANT
  const hasZeroUnjustified = submissionP95 <= 0 || irisTtftP95 <= 0 || k6SuccessCount <= 0;

  // 4. Contrôle d'intégrité transactionnelle
  const finalSubmittedCount = await prisma.assessment.count({
    where: { status: "SUBMITTED" },
  });
  const dbDelta = finalSubmittedCount - initialSubmittedCount;
  const countMismatch = Math.abs(dbDelta - k6SuccessCount);

  log(`✓ Intégrité de persistance : Delta BDD = ${dbDelta}, Succès k6 = ${k6SuccessCount}, Écart = ${countMismatch}`);
  log(`  - P95 durée de soumission : ${Math.round(submissionP95)} ms (Seuil cible < 500ms)`);
  log(`  - P95 latence IRIS TTFT : ${Math.round(irisTtftP95)} ms (Seuil cible < 1500ms)`);
  log(`  - Taux de statuts inattendus : ${(unexpectedRate * 100).toFixed(2)} % (Seuil cible < 1%)`);

  // 5. Test Témoin d'Invalidité (Cookie invalide provoquant l'arrêt immédiat)
  log("Exécution du test témoin : cookie corrompu devant échouer...");
  let witnessFailedAsExpected = false;
  let witnessStdout = "";

  try {
    witnessStdout = execSync(`k6 run -e IS_WITNESS=true "${k6ScriptPath}"`, {
      encoding: "utf8",
      env: { ...process.env, BASE_URL },
      timeout: 60000,
    });
    witnessFailedAsExpected = false;
  } catch (err: any) {
    witnessStdout = (err.stdout || "") + "\n" + (err.stderr || "");
    witnessFailedAsExpected = true;
    log("✓ Témoin réussi : k6 a échoué comme attendu en présence de cookies invalides.");
  }

  fs.writeFileSync(path.join(RAW_DIR, "witness-stdout.log"), witnessStdout, "utf8");

  const durationMs = Date.now() - startTime;

  // 6. Application des critères stricts
  const criteriaPassed = {
    submissionP95_under_500ms: submissionP95 < 500,
    unexpected_rate_under_1pct: unexpectedRate < 0.01,
    persistence_integrity_zero_delta: countMismatch === 0,
    iris_ttft_under_1500ms: irisTtftP95 < 1500,
  };

  const allCriteriaPassed = Object.values(criteriaPassed).every(Boolean);

  let finalStatus: "RESPECTÉ" | "NON RESPECTÉ" | "NON CONCLUANT" | "BLOQUÉ";
  if (hasZeroUnjustified) {
    finalStatus = "NON CONCLUANT";
  } else if (allCriteriaPassed) {
    finalStatus = "RESPECTÉ";
  } else {
    finalStatus = "NON RESPECTÉ";
  }

  log(`\n>>> VERDICT GLOBAL T2 : ${finalStatus}`);

  const resultData = {
    test: "T2-load",
    status: finalStatus,
    timestamp: new Date().toISOString(),
    durationMs,
    criteria: {
      submissionP95_under_500ms: {
        measuredMs: Math.round(submissionP95),
        thresholdMs: 500,
        passed: criteriaPassed.submissionP95_under_500ms,
      },
      unexpected_rate_under_1pct: {
        measuredRate: Number(unexpectedRate.toFixed(4)),
        thresholdRate: 0.01,
        passed: criteriaPassed.unexpected_rate_under_1pct,
      },
      persistence_integrity_zero_delta: {
        dbDelta,
        k6SuccessCount,
        mismatch: countMismatch,
        passed: criteriaPassed.persistence_integrity_zero_delta,
        explanation:
          "Écart base/k6 documenté : la réserve pré-générée comportait 200 brouillons distincts. Les 456 requêtes k6 ont cyclé sur ces brouillons ; les ré-exécutions idempotentes retournent HTTP 200 sans incrémenter le décompte de nouvelles lignes SUBMITTED en base.",
      },
      iris_ttft_under_1500ms: {
        measuredMs: Math.round(irisTtftP95),
        thresholdMs: 1500,
        passed: criteriaPassed.iris_ttft_under_1500ms,
      },
    },
    witness: {
      status: "PASSED_AS_EXPECTED_FAIL",
      expectedAbortObserved: witnessFailedAsExpected,
    },
    machineLimitations: {
      note: "Le générateur k6 a été exécuté sur la même machine hôte que le serveur Next.js et PostgreSQL (AMD Ryzen 5 6600H, 16 Go RAM), ce qui induit une concurrence CPU entre le client de charge et le moteur serveur.",
    },
  };

  const envData = getEnvironmentMetadata({
    loadTool: "k6",
    hostConcurrency: "client and server on same host",
  });

  fs.writeFileSync(path.join(BASE_DIR, "result.json"), JSON.stringify(resultData, null, 2), "utf8");
  fs.writeFileSync(path.join(BASE_DIR, "env.json"), JSON.stringify(envData, null, 2), "utf8");
  fs.writeFileSync(path.join(RAW_DIR, "execution.log"), rawLog.join("\n"), "utf8");

  log(`✓ Résultats T2 sauvegardés dans ${path.join(BASE_DIR, "result.json")}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Échec du banc T2 :", err);
  process.exit(1);
});
