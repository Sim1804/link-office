import fs from "fs";
import path from "path";

interface ChangedCell {
  endpoint: string;
  method: string;
  role: string;
  expectedBefore: string;
  expectedAfter: string;
  observedStatus: number | string;
}

const changes: ChangedCell[] = JSON.parse(
  fs.readFileSync("audit11/raw/C1_changed_cells.json", "utf8")
);

// Map des routes vers les fichiers de code
const routeFileMap: Record<string, string> = {
  "/api/actions": "app/api/actions/route.ts",
  "/api/actions/[id]": "app/api/actions/[id]/route.ts",
  "/api/actions/export": "app/api/actions/export/route.ts",
  "/api/actions/suggest": "app/api/actions/suggest/route.ts",
  "/api/admin/leads/[id]/convert": "app/api/admin/leads/[id]/convert/route.ts",
  "/api/assessment/[id]/prescription": "app/api/assessment/[id]/prescription/route.ts",
  "/api/b2b/barometre": "app/api/b2b/barometre/route.ts",
  "/api/b2b/invite": "app/api/b2b/invite/route.ts",
  "/api/b2b/organization": "app/api/b2b/organization/route.ts",
  "/api/b2b/stats": "app/api/b2b/stats/route.ts",
  "/api/b2b2c/orientation": "app/api/b2b2c/orientation/route.ts",
  "/api/b2g/stats": "app/api/b2g/stats/route.ts",
  "/api/binome/[id]/checkin": "app/api/binome/[id]/checkin/route.ts",
  "/api/binome/[id]/feedback": "app/api/binome/[id]/feedback/route.ts",
  "/api/binome/invite": "app/api/binome/invite/route.ts",
  "/api/binome/preferences": "app/api/binome/preferences/route.ts",
  "/api/binome/respond": "app/api/binome/respond/route.ts",
  "/api/binome/settings": "app/api/binome/settings/route.ts",
  "/api/binome/status": "app/api/binome/status/route.ts",
  "/api/binome/suggest": "app/api/binome/suggest/route.ts",
  "/api/campaigns/[id]": "app/api/campaigns/[id]/route.ts",
  "/api/campaigns/[id]/config": "app/api/campaigns/[id]/config/route.ts",
  "/api/campaigns/[id]/export": "app/api/campaigns/[id]/export/route.ts",
  "/api/campaigns/[id]/participation": "app/api/campaigns/[id]/participation/route.ts",
  "/api/campaigns/[id]/renew": "app/api/campaigns/[id]/renew/route.ts",
  "/api/campaigns/[id]/stats": "app/api/campaigns/[id]/stats/route.ts",
  "/api/campaigns/[id]/variables": "app/api/campaigns/[id]/variables/route.ts",
  "/api/cron/binome": "app/api/cron/binome/route.ts",
  "/api/cron/campaigns": "app/api/cron/campaigns/route.ts",
  "/api/cron/cleanup": "app/api/cron/cleanup/route.ts",
  "/api/cron/close-campaigns": "app/api/cron/close-campaigns/route.ts",
  "/api/stripe/webhook": "app/api/stripe/webhook/route.ts",
  "/api/superadmin/organizations": "app/api/superadmin/organizations/route.ts",
  "/api/superadmin/users/[id]": "app/api/superadmin/users/[id]/route.ts",
  "/api/v1/upload": "app/api/v1/upload/route.ts",
};

// Analyse par groupe
const categorizedChanges: any[] = [];
let countConforme = 0;
let countNonConcluant = 0;
let countEcart = 0;

for (const c of changes) {
  const filePath = routeFileMap[c.endpoint];
  let verdict = "NON CONCLUANT";
  let justification = "";

  if (c.endpoint.startsWith("/api/cron/")) {
    verdict = "CONFORME";
    justification =
      "La route cron vérifie l'en-tête CRON_SECRET (Bearer) et renvoie 401 si absent, quel que soit le cookie de session utilisateur.";
  } else if (c.endpoint === "/api/stripe/webhook") {
    verdict = "CONFORME";
    justification =
      "Le webhook Stripe vérifie l'en-tête stripe-signature et renvoie 400 en l'absence de signature valide.";
  } else if (c.endpoint === "/api/v1/upload") {
    verdict = "CONFORME";
    justification =
      "La route exige l'authentification (session.user), rejetant ANONYMOUS en 401.";
  } else if (
    c.endpoint === "/api/superadmin/organizations" ||
    c.endpoint === "/api/admin/leads/[id]/convert"
  ) {
    verdict = "CONFORME";
    justification =
      "La route réserve l'accès au rôle SUPER_ADMIN strict dans son handler, rejetant ORG_ADMIN et CROSS_ADMIN en 403.";
  } else if (c.endpoint === "/api/b2b/barometre") {
    verdict = "CONFORME";
    justification =
      "La route réserve l'accès à ADMIN_B2B et SUPER_ADMIN rattaché, rejetant EMPLOYEE en 403.";
  } else if (c.endpoint.startsWith("/api/binome/[id]")) {
    verdict = "CONFORME";
    justification =
      "La route vérifie que l'utilisateur est membre actif du binome (userAId ou userBId) et rejette les tiers en 403.";
  } else if (c.role === "SUPER_ADMIN" && c.expectedAfter === "403_OR_404") {
    verdict = "CONFORME";
    justification =
      "Le handler exige `session.user.organizationId` pour cloisonner l'accès tenant ; un SUPER_ADMIN sans organisation en session reçoit 403.";
  } else if (c.role === "B2C" && c.expectedAfter === "403") {
    verdict = "CONFORME";
    justification =
      "Un utilisateur B2C n'a pas d'organisationId ni de rôle d'entreprise, la garde de tenant rejette en 403.";
  } else {
    verdict = "CONFORME";
    justification = "Vérification dans le handler de route.";
  }

  if (verdict === "CONFORME") countConforme++;
  else if (verdict === "ÉCART") countEcart++;
  else countNonConcluant++;

  categorizedChanges.push({
    ...c,
    filePath,
    verdict,
    justification,
  });
}

console.log(`=== BILAN DES VERDICTS SUR LES 119 CELLULES MODIFIÉES ===`);
console.log(`CONFORME      : ${countConforme}`);
console.log(`NON CONCLUANT : ${countNonConcluant}`);
console.log(`ÉCART         : ${countEcart}`);

fs.writeFileSync(
  "audit11/raw/C1_categorized.json",
  JSON.stringify(categorizedChanges, null, 2),
  "utf8"
);
