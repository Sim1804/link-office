import fs from "fs";
import { execSync } from "child_process";
import path from "path";

// 1. Extraire spec-rules.ts au commit 591f977
const oldSpecContent = execSync("git show 591f977:validation/t4-authz/spec-rules.ts", {
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});

fs.writeFileSync("scratch/spec-rules-591f977.ts", oldSpecContent, "utf8");

async function main() {
  const oldModule = await import("../../scratch/spec-rules-591f977");
  const currentModule = await import("../../validation/t4-authz/spec-rules");

  // Charger les résultats observés
  const execResultsPath = path.resolve("validation/t4-authz/raw/matrix-exec-results.json");
  const execResults = JSON.parse(fs.readFileSync(execResultsPath, "utf8"));

  const identities = [
    "ANONYMOUS",
    "B2C",
    "EMPLOYEE",
    "ORG_ADMIN",
    "CROSS_ADMIN",
    "SUPER_ADMIN",
  ] as const;

  const currentRoutes = (currentModule as any).SPEC_ROUTES || {};
  const oldRoutes = (oldModule as any).SPEC_ROUTES || {};

  const changedCells: any[] = [];

  for (const [endpoint, spec] of Object.entries(currentRoutes) as [string, any][]) {
    for (const method of spec.methods) {
      for (const id of identities) {
        let oldExpected = "N/A";
        if (oldRoutes[endpoint] && oldRoutes[endpoint].methods.includes(method)) {
          oldExpected = oldModule.getExpectedStatus(endpoint, method, id);
        }

        const newExpected = currentModule.getExpectedStatus(endpoint, method, id);

        if (oldExpected !== newExpected) {
          // Trouver le statut observé
          const observedEntry = execResults.find(
            (r: any) => r.endpoint === endpoint && r.method === method && r.identity === id
          );
          const observedStatus = observedEntry ? observedEntry.status : "NON_TESTE";

          changedCells.push({
            endpoint,
            method,
            identity: id,
            oldExpected,
            newExpected,
            observedStatus,
          });
        }
      }
    }
  }

  console.log(`Total cellules modifiées depuis 591f977 : ${changedCells.length}`);
  fs.writeFileSync(
    "audit11/raw/C1_changed_cells.json",
    JSON.stringify(changedCells, null, 2),
    "utf8"
  );
  console.log("Détail sauvegardé dans audit11/raw/C1_changed_cells.json");
}

main().catch(console.error);
