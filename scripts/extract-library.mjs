import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import { writeFile } from "node:fs/promises";

const source = "C:/Users/simon/Downloads/Bibliotheques_LINK_OFFICE_V1.xlsm";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const sheets = ["Tags", "Besoins", "Facteurs", "Recommandations", "Micro-défis", "Partenaires", "Ressources", "Programmes LO", "Schéma BDD"];
const library = {};
for (const name of sheets) {
  const values = workbook.worksheets.getItem(name).getUsedRange(true).values;
  const [headers, ...rows] = values;
  library[name] = rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? null])));
}
await writeFile("prisma/link-office-library.json", JSON.stringify(library, null, 2), "utf8");
