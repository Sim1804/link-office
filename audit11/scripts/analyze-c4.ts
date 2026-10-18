import fs from "fs";

const result = JSON.parse(fs.readFileSync("validation/t4-authz/result.json", "utf8"));
const execResults = JSON.parse(fs.readFileSync("validation/t4-authz/raw/matrix-exec-results.json", "utf8"));

const divergences = execResults.filter((r: any) => !r.passed);

console.log("=== BILAN REJEU MATRICE T4 (C4) ===");
console.log(`Total cellules testées : ${result.totalCells}`);
console.log(`Conformes              : ${result.passedCells}`);
console.log(`Divergences            : ${result.divergenceBreakdown.totalDivergences}`);
console.log("Détail des divergences :");
console.log(`- Interdit mais 2xx                 : ${result.divergenceBreakdown.forbiddenBut2xx}`);
console.log(`- Erreurs serveur (5xx)             : ${result.divergenceBreakdown.error5xx}`);
console.log(`- 401/403 interchangeables          : ${result.divergenceBreakdown.interchange401_403}`);
console.log(`- Entrées invalides (attendu 2xx)   : ${result.divergenceBreakdown.invalidTestInput}`);
console.log(`- Spécification manquante           : ${result.divergenceBreakdown.unspecified}`);

// Analyse des 39 cellules interdites avec statut 2xx
const forbidden2xx = result.forbidden2xxDetails;
console.log(`\nAnalyse des ${forbidden2xx.length} cellules forbidden2xx :`);
let countSelfRead = 0;
let countSuperAdmin = 0;
let countLeak = 0;

for (const item of forbidden2xx) {
  if (item.bodyContainsOrgA) {
    countLeak++;
    console.log(`[ALERTE FUITE] ${item.method} ${item.endpoint} (${item.identity})`);
  } else if (item.identity === "SUPER_ADMIN") {
    countSuperAdmin++;
  } else {
    countSelfRead++;
  }
}

console.log(`- Lectures de soi (Self-reads Q1)           : ${countSelfRead}`);
console.log(`- SUPER_ADMIN sur routes tenant (Q2)       : ${countSuperAdmin}`);
console.log(`- Fuites effectives de données tierces (Org A) : ${countLeak}`);
