/**
 * @file run-all.ts
 * @module validation/run-all
 * @description Exécute l'intégralité de la suite de validation formelle de manière séquentielle :
 * T5 -> T4 -> T2 -> T3 -> T1 -> T10 -> verify-numbers.
 */

import { execSync } from "child_process";
import path from "path";

const STEPS = [
  { name: "T5 — Scoring et renormalisation", cmd: "npm run validate:t5" },
  { name: "T4 — Matrice d'autorisation et recoupement", cmd: "npm run validate:t4" },
  { name: "T2 — Charge authentifiée k6", cmd: "npm run validate:t2" },
  { name: "T3 — Latence et coût réels IRIS", cmd: "npm run validate:t3" },
  { name: "T1 — Cascade de sécurité IRIS", cmd: "npm run validate:t1" },
  { name: "T10 — Effacement, export, hygiène", cmd: "npm run validate:t10" },
  { name: "Vérification de cohérence mémoire <-> résultats", cmd: "npx tsx validation/verify-numbers/verify.ts" },
];

async function main() {
  console.log("=============================================================");
  console.log("  EXÉCUTION GLOBALE DE LA SUITE DE VALIDATION LINK-OFFICE    ");
  console.log("=============================================================\n");

  const results: Array<{ step: string; status: "SUCCÈS_SCRIPT" | "ÉCHEC_SCRIPT"; code: number; durationMs: number }> = [];

  for (const step of STEPS) {
    console.log(`\n>>> Lancement : ${step.name}`);
    const t0 = Date.now();
    let exitCode = 0;
    try {
      execSync(step.cmd, {
        cwd: path.resolve(__dirname, ".."),
        stdio: "inherit",
        env: { ...process.env, NODE_ENV: "production" },
      });
    } catch (err: any) {
      exitCode = err.status || 1;
      console.warn(`[SUITE] Le script pour "${step.name}" a terminé avec le code ${exitCode}.`);
    }
    const durationMs = Date.now() - t0;
    results.push({
      step: step.name,
      status: exitCode === 0 ? "SUCCÈS_SCRIPT" : "ÉCHEC_SCRIPT",
      code: exitCode,
      durationMs,
    });
  }

  console.log("\n=============================================================");
  console.log("                  RÉCAPITULATIF DES EXÉCUTIONS               ");
  console.log("=============================================================");
  for (const r of results) {
    const icon = r.status === "SUCCÈS_SCRIPT" ? "✓" : "⚠️";
    console.log(`${icon} ${r.step.padEnd(50)} [${r.status} (${r.code}) en ${(r.durationMs / 1000).toFixed(1)}s]`);
  }
  console.log("\nConsultez validation/REPORT.md et validation/TRACEABILITY.md pour l'analyse des résultats.");
}

main().catch(console.error);
