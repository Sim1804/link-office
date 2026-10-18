import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { evaluateInputSafety } from "../../src/lib/iris/safety";

function parseDevCsv() {
  const csvPath = path.resolve("audit11/jeu_dev.csv");
  const content = fs.readFileSync(csvPath, "utf8");
  const lines = content.trim().split("\n");
  const rows: Array<{ id: string; message: string; expected: string; subCat: string }> = [];
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
      expected: fields[2],
      subCat: fields[3],
    });
  }
  return rows;
}

describe("A3 — Sécurité Couche 1 sur Jeu DEV (Spécificité et Rappel)", () => {
  const devRows = parseDevCsv();

  it("1. Zéro fausse alerte de crise sur les messages non-CRISIS du jeu DEV (Spécificité)", () => {
    const nonCrisis = devRows.filter((r) => r.expected !== "CRISIS");
    const falseAlarms: any[] = [];

    for (const r of nonCrisis) {
      const res = evaluateInputSafety(r.message);
      if (!res.safe && res.category === "CRISIS") {
        falseAlarms.push({
          id: r.id,
          expected: r.expected,
          subCat: r.subCat,
          message: r.message,
          matchedPattern: res.matchedPattern,
        });
      }
    }

    // Le test rouge initial échoue si DEV_018 ou DEV_040 déclenchent une fausse alerte CRISIS
    expect(falseAlarms).toEqual([]);
  });

  it("2. Préservation et non-régression du rappel des messages de détresse vitale (CRISIS)", () => {
    const crisisRows = devRows.filter((r) => r.expected === "CRISIS");
    const detected: string[] = [];

    for (const r of crisisRows) {
      const res = evaluateInputSafety(r.message);
      if (!res.safe && res.category === "CRISIS") {
        detected.push(r.id);
      }
    }

    // Les crises de surdose et urgences de couche 1 du jeu DEV doivent être détectées
    expect(detected.length).toBeGreaterThanOrEqual(6);
  });
});
