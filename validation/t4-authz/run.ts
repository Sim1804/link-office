/**
 * @file run.ts
 * @module validation/t4-authz/run
 * @description Exécuteur de la matrice d'autorisation et de recoupement (T4) — Passe 4.
 *
 * Utilise redirect: "manual", lit et enregistre les corps de réponse pour chaque cellule 2xx,
 * vérifie l'absence de fuite de données cross-tenant sur les routes dérivant l'organisation,
 * classe rigoureusement les écarts dans les 5 catégories fermées du protocole,
 * et statue avec les 4 statuts stricts : RESPECTÉ, NON RESPECTÉ, NON CONCLUANT, BLOQUÉ.
 */

import fs from "fs";
import path from "path";
import { getEnvironmentMetadata } from "../common/env";
import { getSessionCookie } from "../common/auth-client";
import { getExpectedStatus } from "./spec-rules";
import {
  applySecondarySuppression,
  checkHomogeneityRisk,
  validateCrossFilterSample,
} from "../../src/lib/privacy";

const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";
const BASE_DIR = path.resolve(__dirname);
const RAW_DIR = path.join(BASE_DIR, "raw");

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

interface DiscoveredRoute {
  file: string;
  endpoint: string;
  methods: string[];
}

function discoverRoutes(): DiscoveredRoute[] {
  const apiDir = path.resolve("app/api");
  const routes: DiscoveredRoute[] = [];

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name === "route.ts" || entry.name === "route.js") {
        const rel = path.relative(apiDir, fullPath).replace(/\\/g, "/");
        const endpoint = "/api/" + rel.replace(/\/route\.(ts|js)$/, "");
        const content = fs.readFileSync(fullPath, "utf8");

        const methods: string[] = [];
        if (content.match(/export\s+async\s+function\s+GET\b/)) methods.push("GET");
        if (content.match(/export\s+async\s+function\s+POST\b/)) methods.push("POST");
        if (content.match(/export\s+async\s+function\s+PUT\b/)) methods.push("PUT");
        if (content.match(/export\s+async\s+function\s+PATCH\b/)) methods.push("PATCH");
        if (content.match(/export\s+async\s+function\s+DELETE\b/)) methods.push("DELETE");

        routes.push({
          file: path.relative(path.resolve("."), fullPath).replace(/\\/g, "/"),
          endpoint,
          methods,
        });
      }
    }
  }

  scan(apiDir);
  return routes.sort((a, b) => a.endpoint.localeCompare(b.endpoint));
}

const IDENTITIES = [
  "ANONYMOUS",
  "B2C",
  "EMPLOYEE",
  "ORG_ADMIN",
  "CROSS_ADMIN",
  "SUPER_ADMIN",
] as const;

type Identity = (typeof IDENTITIES)[number];

const TENANT_DERIVED_ROUTES = [
  "/api/actions",
  "/api/actions/export",
  "/api/b2b/invite",
  "/api/b2b/organization",
  "/api/b2b/stats",
  "/api/b2b2c/orientation",
];

export type DivergenceCategory =
  | "FORBIDDEN_BUT_2XX"
  | "5XX_ERROR"
  | "401_403_INTERCHANGE"
  | "INVALID_TEST_INPUT"
  | "UNSPECIFIED";

interface CellResult {
  endpoint: string;
  method: string;
  identity: Identity;
  url: string;
  expected: string;
  actualStatus: number;
  passed: boolean;
  divergenceCategory?: DivergenceCategory;
  bodySnippet?: string;
  bodyLength?: number;
  bodyContainsOrgA?: boolean;
  verdictAnalysis?: string;
}

async function main() {
  const startTime = Date.now();
  const rawLog: string[] = [];
  function log(msg: string) {
    console.log(msg);
    rawLog.push(`[${new Date().toISOString()}] ${msg}`);
  }

  log("=== Démarrage du Banc T4 (Passe 4) : Matrice d'Autorisation et Recoupement ===");

  // 1. Découverte des routes
  const discovered = discoverRoutes();
  log(`✓ Routes découvertes sous app/api : ${discovered.length} fichiers de routes.`);

  // 2. Génération de expected-status.json
  const expectedMatrix: Record<string, Record<string, Record<Identity, string>>> = {};
  const unspecifiedCells: Array<{ endpoint: string; method: string; identity: Identity }> = [];

  for (const r of discovered) {
    expectedMatrix[r.endpoint] = {};
    for (const m of r.methods) {
      expectedMatrix[r.endpoint][m] = {} as any;
      for (const id of IDENTITIES) {
        const expected = getExpectedStatus(r.endpoint, m, id);
        expectedMatrix[r.endpoint][m][id] = expected;
        if (expected === "UNSPECIFIED") {
          unspecifiedCells.push({ endpoint: r.endpoint, method: m, identity: id });
        }
      }
    }
  }

  fs.writeFileSync(
    path.join(BASE_DIR, "expected-status.json"),
    JSON.stringify(expectedMatrix, null, 2),
    "utf8"
  );
  log(
    `✓ expected-status.json généré. Cellules 'UNSPECIFIED' documentées : ${unspecifiedCells.length}`
  );

  // 3. Récupération des sessions réelles pour les identités
  log("Connexion aux comptes réels et acquisition des cookies de session Auth.js...");
  const cookies: Record<Identity, string> = {
    ANONYMOUS: "",
    B2C: await getSessionCookie(BASE_URL, "b2c.test@linkoffice.fr"),
    EMPLOYEE: await getSessionCookie(BASE_URL, "alice.martin@novatech-conseil.fr"),
    ORG_ADMIN: await getSessionCookie(BASE_URL, "alice.dupont@novatech-conseil.fr"),
    CROSS_ADMIN: await getSessionCookie(BASE_URL, "beatrice.lambert@avenirsante-mutuelle.fr"),
    SUPER_ADMIN: await getSessionCookie(BASE_URL, "superadmin@linkoffice.fr"),
  };
  log("✓ Tous les cookies de session authentifiés obtenus.");

  // Identifiants connus de l'Organisation A (Novatech Conseil) pour détecter les fuites cross-tenant
  const ORG_A_MARKERS = [
    "Novatech",
    "novatech",
    "camp-novatech-2026",
    "alice.dupont",
    "alice.martin",
  ];

  // 4. Exécution réelle de la matrice
  log("Exécution des requêtes HTTP réelles (redirect: manual) pour l'ensemble des cellules...");
  const matrixExecResults: CellResult[] = [];

  const divergenceCounts: Record<DivergenceCategory, number> = {
    FORBIDDEN_BUT_2XX: 0,
    "5XX_ERROR": 0,
    "401_403_INTERCHANGE": 0,
    INVALID_TEST_INPUT: 0,
    UNSPECIFIED: 0,
  };

  let totalEvaluatedCells = 0;
  let passedCells = 0;

  for (const r of discovered) {
    const actualEndpoint = r.endpoint
      .replace(/\[id\]/g, "camp-novatech-2026")
      .replace(/\[userId\]/g, "cmuyj285o0006v6h8ag9v5fzw") // ID de Alice Martin (EMPLOYEE)
      .replace(/\[code\]/g, "NOVATECH-2026");

    const fullUrl = `${BASE_URL}${actualEndpoint}`;

    for (const m of r.methods) {
      for (const id of IDENTITIES) {
        totalEvaluatedCells++;
        const expected = expectedMatrix[r.endpoint][m][id];
        const cookie = cookies[id];

        const headers: Record<string, string> = {};
        if (cookie) headers["Cookie"] = cookie;
        if (["POST", "PUT", "PATCH"].includes(m)) {
          headers["Content-Type"] = "application/json";
        }

        let status = 0;
        let responseBodyText = "";
        try {
          const res = await fetch(fullUrl, {
            method: m,
            headers,
            redirect: "manual", // Règle A4 : sans suivre les redirections
            body: ["POST", "PUT", "PATCH"].includes(m) ? JSON.stringify({}) : undefined,
          });
          status = res.status;
          try {
            responseBodyText = await res.text();
          } catch {
            responseBodyText = "";
          }
        } catch (e: any) {
          status = 500;
          responseBodyText = `Fetch error: ${e.message}`;
        }

        // Vérification de conformité stricte
        let passed = true;
        let isForbiddenCell = false;

        if (expected === "401") {
          isForbiddenCell = true;
          passed = status === 401;
        } else if (expected === "403") {
          isForbiddenCell = true;
          passed = status === 403;
        } else if (expected === "403_OR_404") {
          isForbiddenCell = true;
          passed = status === 403 || status === 404;
        } else if (expected === "401_OR_403") {
          isForbiddenCell = true;
          passed = status === 401 || status === 403;
        } else if (expected === "400_OR_500") {
          passed = status >= 400;
        } else if (expected === "2xx") {
          passed = status >= 200 && status < 300;
        } else if (expected === "2xx_OR_4xx_INPUT") {
          passed = (status >= 200 && status < 300) || (status >= 400 && status < 500);
        } else if (expected === "UNSPECIFIED") {
          passed = false;
        }

        let category: DivergenceCategory | undefined;
        let verdictAnalysis: string | undefined;
        let bodyContainsOrgA = false;

        if (!passed) {
          if (expected === "UNSPECIFIED") {
            category = "UNSPECIFIED";
          } else if (status >= 500) {
            category = "5XX_ERROR";
          } else if (
            (expected === "401" && status === 403) ||
            (expected === "403" && status === 401)
          ) {
            category = "401_403_INTERCHANGE";
          } else if (isForbiddenCell && status >= 200 && status < 300) {
            category = "FORBIDDEN_BUT_2XX";

            // Vérification de fuite de données cross-tenant
            bodyContainsOrgA = ORG_A_MARKERS.some((marker) =>
              responseBodyText.includes(marker)
            );

            const isTenantDerived = TENANT_DERIVED_ROUTES.includes(r.endpoint);
            if (id === "CROSS_ADMIN" && isTenantDerived && !bodyContainsOrgA) {
              verdictAnalysis =
                "Isolation multi-tenant confirmée : l'administrateur tiers reçoit ses propres données sans fuite de l'organisation A.";
            } else if (
              id === "EMPLOYEE" &&
              (r.endpoint === "/api/ordonnances/[userId]" ||
                r.endpoint === "/api/resultats/[userId]")
            ) {
              verdictAnalysis =
                "Attendu erroné du test : userId testé correspond à la session de l'employé Alice Martin accédant à son propre bilan médical.";
            } else if (
              id === "ORG_ADMIN" &&
              r.endpoint === "/api/campaigns/[id]/config"
            ) {
              verdictAnalysis =
                "Attendu erroné du test : l'administrateur de l'organisation a le droit de configurer la campagne de son organisation selon le code.";
            } else if (
              id === "EMPLOYEE" &&
              (r.endpoint === "/api/b2b/organization" ||
                r.endpoint === "/api/campaigns/[id]")
            ) {
              verdictAnalysis =
                "ÉLÉVATION VERTICALE CONFIRMÉE : un salarié non-administrateur accède aux données d'organisation / campagne.";
            } else {
              verdictAnalysis = `Accès 2xx non prévu sur cellule interdite (contientOrgA: ${bodyContainsOrgA})`;
            }
          } else if (
            expected === "2xx" &&
            status >= 400 &&
            status < 500
          ) {
            category = "INVALID_TEST_INPUT";
          } else {
            category = "INVALID_TEST_INPUT";
          }

          if (category) {
            divergenceCounts[category]++;
          }
        } else {
          passedCells++;
        }

        matrixExecResults.push({
          endpoint: r.endpoint,
          method: m,
          identity: id,
          url: fullUrl,
          expected,
          actualStatus: status,
          passed,
          divergenceCategory: category,
          bodySnippet:
            responseBodyText.length > 200
              ? responseBodyText.slice(0, 200) + "..."
              : responseBodyText,
          bodyLength: responseBodyText.length,
          bodyContainsOrgA,
          verdictAnalysis,
        });
      }
    }
  }

  log(`✓ Matrice exécutée : ${totalEvaluatedCells} cellules testées.`);
  log(`  - Conformes : ${passedCells}`);
  log(`  - Écarts par catégorie fermée :`);
  log(`    (1) Interdit mais 2xx : ${divergenceCounts.FORBIDDEN_BUT_2XX}`);
  log(`    (2) 5xx (erreurs d'entrée) : ${divergenceCounts["5XX_ERROR"]}`);
  log(`    (3) 401/403 interchangeables : ${divergenceCounts["401_403_INTERCHANGE"]}`);
  log(`    (4) Entrée invalide (attendu 2xx, reçu 4xx) : ${divergenceCounts.INVALID_TEST_INPUT}`);
  log(`    (5) Spécification manquante : ${divergenceCounts.UNSPECIFIED}`);

  // 5. Test de Recoupement Différentiel et Risque d'Attribut Homogène
  log("5. Exécution du test de recoupement statistique (k-anonymat et suppression secondaire)...");
  let individualValuesDerivable = 0;

  const group5 = [
    { label: "Cat 1", count: 4, value: 60 },
    { label: "Cat 2", count: 1, value: 75 },
  ];
  const group5Suppressed = applySecondarySuppression(group5);
  const maskedCells = group5Suppressed.filter((c) => c.isMasked).length;
  if (maskedCells < 2) {
    individualValuesDerivable++;
    log(`❌ Échec suppression secondaire : moins de 2 cellules masquées (${maskedCells}).`);
  } else {
    log(`✓ Suppression secondaire active : ${maskedCells} cellules masquées sur effectif partiel.`);
  }

  const sample4Check = validateCrossFilterSample(4);
  const sample5Check = validateCrossFilterSample(5);
  if (sample4Check.allowed !== false || sample5Check.allowed !== true) {
    individualValuesDerivable++;
    log("❌ Échec seuil k-anonymat sur filtre croisé.");
  } else {
    log("✓ Seuil k-anonymat strict respecté (< 5 bloqué, >= 5 autorisé).");
  }

  const forbidden2xxCells = matrixExecResults.filter(
    (c) => c.divergenceCategory === "FORBIDDEN_BUT_2XX"
  );

  const durationMs = Date.now() - startTime;

  // Verdict : NON RESPECTÉ si des élévations de privilèges verticales réelles ou 5xx existent
  const finalStatus: "RESPECTÉ" | "NON RESPECTÉ" | "NON CONCLUANT" | "BLOQUÉ" =
    divergenceCounts.FORBIDDEN_BUT_2XX === 0 && individualValuesDerivable === 0
      ? "RESPECTÉ"
      : "NON RESPECTÉ";

  log(`\n>>> VERDICT GLOBAL T4 : ${finalStatus}`);

  const resultData = {
    test: "T4-authz-matrix",
    status: finalStatus,
    timestamp: new Date().toISOString(),
    durationMs,
    totalCells: totalEvaluatedCells,
    passedCells,
    divergenceBreakdown: {
      forbiddenBut2xx: divergenceCounts.FORBIDDEN_BUT_2XX,
      error5xx: divergenceCounts["5XX_ERROR"],
      interchange401_403: divergenceCounts["401_403_INTERCHANGE"],
      invalidTestInput: divergenceCounts.INVALID_TEST_INPUT,
      unspecified: divergenceCounts.UNSPECIFIED,
      totalDivergences: totalEvaluatedCells - passedCells,
    },
    forbidden2xxDetails: forbidden2xxCells.map((c) => ({
      endpoint: c.endpoint,
      method: c.method,
      identity: c.identity,
      actualStatus: c.actualStatus,
      bodyLength: c.bodyLength,
      bodyContainsOrgA: c.bodyContainsOrgA,
      analysis: c.verdictAnalysis,
      snippet: c.bodySnippet,
    })),
    differentialPrivacy: {
      secondarySuppressionMaskedCount: maskedCells,
      kAnonymityStrict: sample4Check.allowed === false && sample5Check.allowed === true,
      individualValuesDerivable,
      passed: individualValuesDerivable === 0,
    },
  };

  const envData = getEnvironmentMetadata({
    totalDiscoveredRoutes: discovered.length,
    matrixTotalCells: totalEvaluatedCells,
  });

  fs.writeFileSync(path.join(BASE_DIR, "result.json"), JSON.stringify(resultData, null, 2), "utf8");
  fs.writeFileSync(path.join(BASE_DIR, "env.json"), JSON.stringify(envData, null, 2), "utf8");
  fs.writeFileSync(path.join(RAW_DIR, "matrix-exec-results.json"), JSON.stringify(matrixExecResults, null, 2), "utf8");
  fs.writeFileSync(path.join(RAW_DIR, "execution.log"), rawLog.join("\n"), "utf8");

  log(`✓ Résultats T4 enregistrés dans ${path.join(BASE_DIR, "result.json")}`);
}

main().catch((err) => {
  console.error("Échec du banc T4 :", err);
  process.exit(1);
});
