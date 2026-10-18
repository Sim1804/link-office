import fs from "fs";
import path from "path";
import { evaluateInputSafety } from "../../src/lib/iris/safety";

function parseCsv(content: string) {
  const lines = content.trim().split("\n");
  const rows: any[] = [];
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
      categorie_attendue: fields[2],
      sous_categorie: fields[3],
      justification: fields[4],
    });
  }
  return rows;
}

export function runDevEvaluation() {
  const devPath = path.resolve("audit11/jeu_dev.csv");
  const rawContent = fs.readFileSync(devPath, "utf8");
  const rows = parseCsv(rawContent);

  const matrix: Record<string, Record<string, number>> = {
    CRISIS: { CRISIS: 0, MEDICAL: 0, JAILBREAK: 0, SAFE: 0, OFF_TOPIC: 0 },
    MEDICAL: { CRISIS: 0, MEDICAL: 0, JAILBREAK: 0, SAFE: 0, OFF_TOPIC: 0 },
    JAILBREAK: { CRISIS: 0, MEDICAL: 0, JAILBREAK: 0, SAFE: 0, OFF_TOPIC: 0 },
    SAFE: { CRISIS: 0, MEDICAL: 0, JAILBREAK: 0, SAFE: 0, OFF_TOPIC: 0 },
  };

  const falseAlarmsCrisis: any[] = [];
  const missedCrisis: any[] = [];
  const details: any[] = [];

  for (const r of rows) {
    const res = evaluateInputSafety(r.message);
    const obtained = res.safe ? "SAFE" : (res.category || "UNKNOWN");
    if (!matrix[r.categorie_attendue][obtained]) {
      matrix[r.categorie_attendue][obtained] = 0;
    }
    matrix[r.categorie_attendue][obtained]++;

    if (r.categorie_attendue === "CRISIS" && obtained !== "CRISIS") {
      missedCrisis.push({ id: r.id, message: r.message, obtained, subCategory: r.sous_categorie, matchedPattern: res.matchedPattern });
    }

    if (r.categorie_attendue !== "CRISIS" && obtained === "CRISIS") {
      falseAlarmsCrisis.push({ id: r.id, message: r.message, expected: r.categorie_attendue, subCategory: r.sous_categorie, matchedPattern: res.matchedPattern });
    }

    details.push({ id: r.id, message: r.message, expected: r.categorie_attendue, obtained, matchedPattern: res.matchedPattern });
  }

  const crisisTotal = rows.filter((r) => r.categorie_attendue === "CRISIS").length; // 16
  const crisisCaught = matrix["CRISIS"]["CRISIS"];
  const nonCrisisTotal = rows.filter((r) => r.categorie_attendue !== "CRISIS").length; // 44

  return {
    matrix,
    crisisTotal,
    crisisCaught,
    crisisRecall: crisisCaught / crisisTotal,
    nonCrisisTotal,
    falseAlarmsCrisisCount: falseAlarmsCrisis.length,
    falseAlarmsRate: falseAlarmsCrisis.length / nonCrisisTotal,
    falseAlarmsCrisis,
    missedCrisis,
    details,
  };
}

if (require.main === module) {
  const report = runDevEvaluation();
  console.log("=== RÉSULTATS ÉVALUATION SUR JEU DEV (60 MESSAGES) ===");
  console.log(`Rappel CRISIS : ${report.crisisCaught}/${report.crisisTotal} (${(report.crisisRecall * 100).toFixed(1)}%)`);
  console.log(`Fausses alertes CRISIS : ${report.falseAlarmsCrisisCount}/${report.nonCrisisTotal} (${(report.falseAlarmsRate * 100).toFixed(1)}%)`);
  console.log("\nFausses alertes de crise :", report.falseAlarmsCrisis);
  console.log("\nCrises manquées en couche 1 :", report.missedCrisis);
}
