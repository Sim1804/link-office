import fs from "fs";
import { execSync } from "child_process";
import path from "path";

// 1. Lire expected-status.json au commit 591f977
const oldJsonStr = execSync("git show 591f977:validation/t4-authz/expected-status.json", {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});
const oldExpected = JSON.parse(oldJsonStr);

// 2. Lire expected-status.json actuel
const curExpected = JSON.parse(
  fs.readFileSync("validation/t4-authz/expected-status.json", "utf8")
);

// 3. Lire les résultats observés actuels
const execResults = JSON.parse(
  fs.readFileSync("validation/t4-authz/raw/matrix-exec-results.json", "utf8")
);

const identities = [
  "ANONYMOUS",
  "B2C",
  "EMPLOYEE",
  "ORG_ADMIN",
  "CROSS_ADMIN",
  "SUPER_ADMIN",
] as const;

interface ChangedCell {
  endpoint: string;
  method: string;
  role: string;
  expectedBefore: string;
  expectedAfter: string;
  observedStatus: number | string;
}

const changes: ChangedCell[] = [];

// Parcourir toutes les routes actuelles
const allEndpoints = Array.from(
  new Set([...Object.keys(oldExpected), ...Object.keys(curExpected)])
).sort();

for (const ep of allEndpoints) {
  const oldMethods = oldExpected[ep] || {};
  const curMethods = curExpected[ep] || {};
  const methods = Array.from(
    new Set([...Object.keys(oldMethods), ...Object.keys(curMethods)])
  ).sort();

  for (const m of methods) {
    for (const id of identities) {
      const before = oldMethods[m]?.[id] ?? "ABSENT";
      const after = curMethods[m]?.[id] ?? "ABSENT";

      if (before !== after) {
        // Trouver le statut observé
        const obs = execResults.find(
          (r: any) => r.endpoint === ep && r.method === m && r.identity === id
        );
        changes.push({
          endpoint: ep,
          method: m,
          role: id,
          expectedBefore: before,
          expectedAfter: after,
          observedStatus: obs ? obs.status : "NON_TESTE",
        });
      }
    }
  }
}

console.log(`=== ANALYSE C1 : CELLULES D'ATTENTE MODIFIÉES DEPUIS 591f977 ===`);
console.log(`Nombre total de cellules dont l'attente a changé : ${changes.length}`);

fs.mkdirSync("audit11/raw", { recursive: true });
fs.writeFileSync(
  "audit11/raw/C1_changed_cells.json",
  JSON.stringify(changes, null, 2),
  "utf8"
);
console.log(`Détails enregistrés dans audit11/raw/C1_changed_cells.json`);

// Regrouper par endpoint
const byEndpoint: Record<string, ChangedCell[]> = {};
for (const c of changes) {
  byEndpoint[c.endpoint] = byEndpoint[c.endpoint] || [];
  byEndpoint[c.endpoint].push(c);
}

console.log("\nRépartition par endpoint :");
for (const [ep, list] of Object.entries(byEndpoint)) {
  console.log(`- ${ep} (${list.length} cellules) : rôles [${list.map((x) => `${x.method}:${x.role}`).join(", ")}]`);
}
