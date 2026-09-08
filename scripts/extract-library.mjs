/**
 * @file extract-library.mjs
 * @module scripts
 * @description Script d'extraction de la bibliothèque LinkOffice depuis le fichier Excel source.
 *
 * Ce script est un utilitaire one-shot exécuté MANUELLEMENT par un développeur.
 * Il lit le fichier Excel `Bibliotheques_LINK_OFFICE_V1.xlsm` et exporte son contenu
 * en JSON structuré pour être utilisé lors du seeding de la base de données.
 *
 * PRÉREQUIS :
 * - Avoir accès au fichier Excel source (`Bibliotheques_LINK_OFFICE_V1.xlsm`)
 * - Mettre à jour le chemin `source` si le fichier est déplacé
 * - Exécuter via l'environnement qui supporte `@oai/artifact-tool`
 *
 * FEUILLES EXTRAITES :
 * - Tags, Besoins, Facteurs
 * - Recommandations, Micro-défis
 * - Partenaires, Ressources, Programmes LO
 * - Schéma BDD (référence)
 *
 * RÉSULTAT :
 * Crée ou remplace le fichier `prisma/link-office-library.json`
 * avec un objet JSON de la forme :
 * {
 *   "Recommandations": [{ "id": "...", "titre": "...", ... }],
 *   "Micro-défis": [{ ... }],
 *   ...
 * }
 *
 * Ce fichier JSON est ensuite lu par `prisma/seed.ts` pour peupler la BDD.
 *
 * @see prisma/seed.ts — Script de seeding qui consomme ce JSON
 * @see prisma/link-office-library.json — Fichier JSON généré (à ne pas committer si sensible)
 */

import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import { writeFile } from "node:fs/promises";

/** Chemin absolu vers le fichier Excel source */
const EXCEL_SOURCE_PATH = "C:/Users/simon/Downloads/Bibliotheques_LINK_OFFICE_V1.xlsm";

/** Chemin de sortie du fichier JSON généré */
const OUTPUT_JSON_PATH = "prisma/link-office-library.json";

/**
 * Noms des feuilles Excel à extraire.
 * L'ordre correspond à l'ordre d'exportation dans le JSON.
 */
const SHEETS_TO_EXTRACT = [
  "Tags",
  "Besoins",
  "Facteurs",
  "Recommandations",
  "Micro-défis",
  "Partenaires",
  "Ressources",
  "Programmes LO",
  "Schéma BDD",
];

// ── Extraction et transformation ─────────────────────────────────────────────

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(EXCEL_SOURCE_PATH));

/**
 * Construit un objet indexé par nom de feuille.
 * Chaque feuille est transformée en tableau d'objets :
 * la première ligne = headers, les suivantes = données.
 */
const libraryData = {};

for (const sheetName of SHEETS_TO_EXTRACT) {
  const sheetValues = workbook.worksheets.getItem(sheetName).getUsedRange(true).values;
  const [headers, ...dataRows] = sheetValues;
  // Chaque ligne devient un objet clé/valeur basé sur les en-têtes
  libraryData[sheetName] = dataRows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? null]))
  );
}

// ── Écriture du fichier JSON ──────────────────────────────────────────────────

await writeFile(OUTPUT_JSON_PATH, JSON.stringify(libraryData, null, 2), "utf8");

console.log(`✅ Bibliothèque extraite avec succès vers ${OUTPUT_JSON_PATH}`);
