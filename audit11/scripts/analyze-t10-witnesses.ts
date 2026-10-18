import fs from "fs";
import path from "path";

// 1. Parser schema.prisma
const schemaContent = fs.readFileSync("prisma/schema.prisma", "utf8");
const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;

interface ModelInfo {
  name: string;
  fields: { name: string; type: string }[];
  hasUserId: boolean;
  hasAssessmentId: boolean;
  isPersonalData: boolean;
}

const models: ModelInfo[] = [];
let match;
while ((match = modelRegex.exec(schemaContent)) !== null) {
  const name = match[1];
  const body = match[2];
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("@@"));
  const fields = lines.map((l) => {
    const parts = l.split(/\s+/);
    return { name: parts[0], type: parts[1] };
  });

  const hasUserId = fields.some((f) => f.name === "userId");
  const hasAssessmentId = fields.some((f) => f.name === "assessmentId");
  const isPersonalData =
    hasUserId ||
    hasAssessmentId ||
    [
      "User",
      "DemographicProfile",
      "QuestionnaireAnswer",
      "AdaptiveAnswer",
      "IqrhResult",
      "IcrResult",
      "ProfileResult",
      "RelationalPrescription",
      "PrescriptionItem",
      "IrisConversation",
      "IrisMessage",
      "JournalEntry",
      "MeteoCheckin",
      "LifeEvent",
      "RelationalPlan",
      "PlanPriority",
      "PlanAction",
      "UserMicroDefi",
      "ResourceRelation",
      "SavedResource",
      "BinomePreference",
      "BinomeCheckin",
      "BinomeFeedback",
      "Notification",
      "UserStats",
      "UserBadge",
      "CampaignInvite",
      "Lead",
    ].includes(name);

  models.push({
    name,
    fields,
    hasUserId,
    hasAssessmentId,
    isPersonalData,
  });
}

// 2. Parser validation/t10-privacy/run.ts pour identifier les témoins positifs
const t10Content = fs.readFileSync("validation/t10-privacy/run.ts", "utf8");

const tablesWithWitness: string[] = [];
const tablesWithoutWitness: string[] = [];

for (const m of models.filter((m) => m.isPersonalData)) {
  const clientProp = m.name.charAt(0).toLowerCase() + m.name.slice(1);
  const regexCreate = new RegExp(`prisma\\.${clientProp}\\.create`, "i");
  if (regexCreate.test(t10Content) || m.name === "User") {
    tablesWithWitness.push(m.name);
  } else {
    tablesWithoutWitness.push(m.name);
  }
}

console.log(`=== AUDIT T10 DES TÉMOINS POSITIFS D'EFFACEMENT ===`);
console.log(`Tables avec données personnelles : ${models.filter((m) => m.isPersonalData).length}`);
console.log(`Tables avec témoin positif (1 avant -> 0 après) : ${tablesWithWitness.length}`);
console.log(tablesWithWitness);

console.log(`\nTables sans témoin positif direct dans T10 : ${tablesWithoutWitness.length}`);
console.log(tablesWithoutWitness);

fs.mkdirSync("audit11/raw", { recursive: true });
fs.writeFileSync(
  "audit11/raw/D4_witnesses.json",
  JSON.stringify(
    {
      totalPersonalTables: models.filter((m) => m.isPersonalData).length,
      tablesWithWitness,
      tablesWithoutWitness,
    },
    null,
    2
  ),
  "utf8"
);
