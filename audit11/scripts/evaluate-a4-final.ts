import fs from "fs";
import path from "path";
import crypto from "crypto";
import { evaluateInputSafety } from "../../src/lib/iris/safety";

function wilsonInterval(k: number, n: number, z = 1.96) {
  if (n === 0) return { proportion: 0, lower: 0, upper: 0 };
  const p = k / n;
  const denominator = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denominator;
  return {
    proportion: parseFloat(p.toFixed(4)),
    lower: parseFloat(Math.max(0, center - margin).toFixed(4)),
    upper: parseFloat(Math.min(1, center + margin).toFixed(4)),
  };
}

interface Row {
  id: string;
  message: string;
  categorie_attendue: "CRISIS" | "MEDICAL" | "JAILBREAK" | "SAFE";
  sous_categorie: string;
  justification: string;
}

function parseCsv(content: string): Row[] {
  const lines = content.trim().split("\n");
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields: string[] = [];
    let current = "";
    let inQuote = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && (c === 0 || line[c - 1] !== "\\")) {
        inQuote = !inQuote;
      } else if (char === "," && !inQuote) {
        fields.push(current.replace(/^"|"$/g, "").replace(/""/g, '"'));
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.replace(/^"|"$/g, "").replace(/""/g, '"'));
    rows.push({
      id: fields[0],
      message: fields[1],
      categorie_attendue: fields[2] as any,
      sous_categorie: fields[3],
      justification: fields[4],
    });
  }
  return rows;
}

async function main() {
  console.log("=== ÉVALUATION COUCHE 1 FINALE SUR JEU FINAL (TÂCHE A4) ===");

  const resPath = path.resolve("audit11/jeu_final.csv");
  const rawContent = fs.readFileSync(resPath, "utf8");
  const sha = crypto.createHash("sha256").update(rawContent).digest("hex");
  const EXPECTED_SHA = "70c348ecaae838f8e42114da2ba5415ae942bb0e71d82b9e0043b1b0d12a2e4d";

  console.log(`Fichier : ${resPath}`);
  console.log(`SHA-256 : ${sha}`);
  if (sha !== EXPECTED_SHA) {
    throw new Error(`VIOLATION D'ÉTANCHÉITÉ : SHA-256 altéré ! (attendu: ${EXPECTED_SHA}, actuel: ${sha})`);
  }
  console.log("✓ Sceau cryptographique conforme.");

  const rows = parseCsv(rawContent);
  console.log(`Messages chargés : ${rows.length}`);

  const cats = ["CRISIS", "MEDICAL", "JAILBREAK", "SAFE"] as const;
  type Cat = (typeof cats)[number];

  const matrix: Record<Cat, Record<Cat | "OFF_TOPIC", number>> = {
    CRISIS: { CRISIS: 0, MEDICAL: 0, JAILBREAK: 0, SAFE: 0, OFF_TOPIC: 0 },
    MEDICAL: { CRISIS: 0, MEDICAL: 0, JAILBREAK: 0, SAFE: 0, OFF_TOPIC: 0 },
    JAILBREAK: { CRISIS: 0, MEDICAL: 0, JAILBREAK: 0, SAFE: 0, OFF_TOPIC: 0 },
    SAFE: { CRISIS: 0, MEDICAL: 0, JAILBREAK: 0, SAFE: 0, OFF_TOPIC: 0 },
  };

  const results: any[] = [];
  const falseAlarmsCrisis: any[] = [];
  const subCatCounts: Record<string, { total: number; crisis: number }> = {};

  for (const r of rows) {
    const safetyRes = evaluateInputSafety(r.message);
    let obtained: Cat | "OFF_TOPIC" = "SAFE";
    if (!safetyRes.safe) {
      obtained = safetyRes.category as any;
    }

    matrix[r.categorie_attendue][obtained]++;

    if (r.categorie_attendue === "CRISIS") {
      subCatCounts[r.sous_categorie] = subCatCounts[r.sous_categorie] || { total: 0, crisis: 0 };
      subCatCounts[r.sous_categorie].total++;
      if (obtained === "CRISIS") {
        subCatCounts[r.sous_categorie].crisis++;
      }
    }

    // Fausse alerte de crise : message non CRISIS classé CRISIS
    if (r.categorie_attendue !== "CRISIS" && obtained === "CRISIS") {
      falseAlarmsCrisis.push({
        id: r.id,
        message: r.message,
        expected: r.categorie_attendue,
        subCategory: r.sous_categorie,
        matchedPattern: safetyRes.matchedPattern,
      });
    }

    results.push({
      id: r.id,
      expected: r.categorie_attendue,
      obtained,
      matchedPattern: safetyRes.matchedPattern || null,
      message: r.message,
    });
  }

  // Calculs
  const crisisTotal = rows.filter((r) => r.categorie_attendue === "CRISIS").length; // 40
  const crisisCaught = matrix["CRISIS"]["CRISIS"];
  const crisisWilson = wilsonInterval(crisisCaught, crisisTotal);

  const nonCrisisTotal = rows.filter((r) => r.categorie_attendue === "MEDICAL" || r.categorie_attendue === "SAFE").length; // 90
  const crisisFalseAlarmsCount = falseAlarmsCrisis.length;
  const faWilson = wilsonInterval(crisisFalseAlarmsCount, nonCrisisTotal);

  const medicalTotal = rows.filter((r) => r.categorie_attendue === "MEDICAL").length; // 30
  const medicalCaught = matrix["MEDICAL"]["MEDICAL"];
  const medicalWilson = wilsonInterval(medicalCaught, medicalTotal);

  const jbTotal = rows.filter((r) => r.categorie_attendue === "JAILBREAK").length; // 20
  const jbCaught = matrix["JAILBREAK"]["JAILBREAK"];
  const jbWilson = wilsonInterval(jbCaught, jbTotal);

  console.log("\n=== 1. MATRICE DE CONFUSION 4x4 (Ligne = Attendu, Colonne = Obtenu) ===");
  console.log("Attendu \\ Obtenu\tCRISIS\tMEDICAL\tJAILBREAK\tSAFE\tOFF_TOPIC");
  for (const exp of cats) {
    console.log(
      `${exp.padEnd(10)}\t${matrix[exp]["CRISIS"]}\t${matrix[exp]["MEDICAL"]}\t${matrix[exp]["JAILBREAK"]}\t${matrix[exp]["SAFE"]}\t${matrix[exp]["OFF_TOPIC"]}`
    );
  }

  console.log("\n=== 2. RAPPEL CRISIS ===");
  console.log(`Global : ${crisisCaught}/${crisisTotal} (${(crisisWilson.proportion * 100).toFixed(1)}%) — Wilson 95% : [${(crisisWilson.lower * 100).toFixed(1)}%, ${(crisisWilson.upper * 100).toFixed(1)}%]`);
  for (const [sub, cnt] of Object.entries(subCatCounts)) {
    const subW = wilsonInterval(cnt.crisis, cnt.total);
    console.log(`- ${sub} : ${cnt.crisis}/${cnt.total} (${(subW.proportion * 100).toFixed(1)}%) — Wilson 95% : [${(subW.lower * 100).toFixed(1)}%, ${(subW.upper * 100).toFixed(1)}%]`);
  }

  console.log("\n=== 3. FAUSSES ALERTES DE CRISE (sur 90 messages MEDICAL / SAFE) ===");
  console.log(`Taux de fausses alertes : ${crisisFalseAlarmsCount}/${nonCrisisTotal} (${(faWilson.proportion * 100).toFixed(1)}%) — Wilson 95% : [${(faWilson.lower * 100).toFixed(1)}%, ${(faWilson.upper * 100).toFixed(1)}%]`);
  console.log(`Nombre de fausses alertes : ${crisisFalseAlarmsCount}`);
  for (const fa of falseAlarmsCrisis) {
    console.log(`[FA] ID: ${fa.id} (${fa.expected}/${fa.subCategory}) | Motif: "${fa.matchedPattern}" | Message: "${fa.message}"`);
  }

  console.log("\n=== 4. RAPPEL COUCHE 1 MEDICAL ET JAILBREAK ===");
  console.log(`MEDICAL   : ${medicalCaught}/${medicalTotal} (${(medicalWilson.proportion * 100).toFixed(1)}%) — Wilson 95% : [${(medicalWilson.lower * 100).toFixed(1)}%, ${(medicalWilson.upper * 100).toFixed(1)}%]`);
  console.log(`JAILBREAK : ${jbCaught}/${jbTotal} (${(jbWilson.proportion * 100).toFixed(1)}%) — Wilson 95% : [${(jbWilson.lower * 100).toFixed(1)}%, ${(jbWilson.upper * 100).toFixed(1)}%]`);

  // Sauvegarde des données brutes
  fs.mkdirSync("audit11/raw", { recursive: true });
  fs.writeFileSync(
    "audit11/raw/A4_final.json",
    JSON.stringify(
      {
        sha256: sha,
        sampleSize: rows.length,
        matrix,
        crisisRecall: { caught: crisisCaught, total: crisisTotal, wilson: crisisWilson },
        crisisSubCategories: subCatCounts,
        falseAlarmsCrisis: { count: crisisFalseAlarmsCount, total: nonCrisisTotal, wilson: faWilson, list: falseAlarmsCrisis },
        medicalRecall: { caught: medicalCaught, total: medicalTotal, wilson: medicalWilson },
        jailbreakRecall: { caught: jbCaught, total: jbTotal, wilson: jbWilson },
        rawResults: results,
      },
      null,
      2
    ),
    "utf8"
  );
  console.log("\n✓ Données brutes enregistrées dans audit11/raw/A4_final.json");
}

main().catch(console.error);
