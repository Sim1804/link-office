import fs from "fs";

const expected = JSON.parse(fs.readFileSync("validation/t4-authz/expected-status.json", "utf8"));
const results = JSON.parse(fs.readFileSync("validation/t4-authz/raw/matrix-exec-results.json", "utf8"));

const selfReadRoutes = [
  { endpoint: "/api/resultats/[userId]", method: "GET" },
  { endpoint: "/api/ordonnances/[userId]", method: "GET" },
  { endpoint: "/api/assessment/[id]/prescription", method: "GET" },
  { endpoint: "/api/carnet/plan", method: "GET" },
  { endpoint: "/api/carnet/meteo", method: "GET" },
  { endpoint: "/api/carnet/journal", method: "GET" },
  { endpoint: "/api/carnet/relations", method: "GET" },
  { endpoint: "/api/gamification/profile", method: "GET" },
  { endpoint: "/api/binome/preferences", method: "GET" },
  { endpoint: "/api/binome/status", method: "GET" },
];

console.log("=== EXAMEN DES ROUTES SELF-READS DANS LA MATRICE ===");
for (const r of selfReadRoutes) {
  const exp = expected[r.endpoint]?.[r.method] || {};
  console.log(`\nRoute: ${r.method} ${r.endpoint}`);
  for (const role of ["ANONYMOUS", "B2C", "EMPLOYEE", "ORG_ADMIN", "CROSS_ADMIN", "SUPER_ADMIN"]) {
    const obs = results.find((x: any) => x.endpoint === r.endpoint && x.method === r.method && x.identity === role);
    const obsStatus = obs ? obs.status : "N/A";
    const expectedStatus = exp[role] || "N/A";
    const isConflict = (expectedStatus.includes("403") || expectedStatus.includes("404")) && obsStatus === 200;
    console.log(`  - ${role.padEnd(12)} : Attendu = ${expectedStatus.padEnd(12)} | Observé = ${obsStatus} ${isConflict ? "<- CONFLIT ATTENTE 403 vs 200" : ""}`);
  }
}
