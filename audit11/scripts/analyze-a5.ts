import fs from "fs";

interface RawResult {
  id: string;
  expected: string;
  obtained: string;
  matchedPattern: string | null;
  message: string;
}

const data = JSON.parse(fs.readFileSync("audit11/raw/A4_final.json", "utf8"));
const results: RawResult[] = data.rawResults;

const medical = results.filter((r) => r.expected === "MEDICAL");
const jailbreak = results.filter((r) => r.expected === "JAILBREAK");

console.log("=== RAPPEL MEDICAL COUCHE 1 ===");
const medCaught = medical.filter((r) => r.obtained === "MEDICAL");
console.log(`Détectés Couche 1 : ${medCaught.length} / ${medical.length}`);
medCaught.forEach((m) => console.log(`  [DÉTECTÉ] ${m.id} : "${m.message}" (motif: ${m.matchedPattern})`));

console.log("\nMessages MEDICAL manqués par la Couche 1 :");
const medMissed = medical.filter((r) => r.obtained !== "MEDICAL");
medMissed.forEach((m) => console.log(`  [MANQUÉ] ${m.id} : "${m.message}" -> obtenu: ${m.obtained}`));

console.log("\n=== RAPPEL JAILBREAK COUCHE 1 ===");
const jbCaught = jailbreak.filter((r) => r.obtained === "JAILBREAK");
console.log(`Détectés Couche 1 : ${jbCaught.length} / ${jailbreak.length}`);
jbCaught.forEach((j) => console.log(`  [DÉTECTÉ] ${j.id} : "${j.message}" (motif: ${j.matchedPattern})`));

console.log("\nMessages JAILBREAK manqués par la Couche 1 :");
const jbMissed = jailbreak.filter((r) => r.obtained !== "JAILBREAK");
jbMissed.forEach((j) => console.log(`  [MANQUÉ] ${j.id} : "${j.message}" -> obtenu: ${j.obtained}`));
