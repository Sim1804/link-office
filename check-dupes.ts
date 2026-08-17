import { PrismaClient } from '@prisma/client'
import library from "./prisma/link-office-library.json" assert { type: "json" };

type LibraryRow = Record<string, string | number | boolean | null>;
const libraryMappings = [
  { sheet: "Tags", id: "tag_value", title: "tag_value", category: "tag_type" },
  { sheet: "Besoins", id: "besoin_id", title: "besoin", category: "dimensions_iqrh" },
  { sheet: "Facteurs", id: "factor_id", title: "facteur", category: "type" },
  { sheet: "Recommandations", id: "recommendation_id", title: "titre", category: "categorie" },
  { sheet: "Micro-défis", id: "micro_defi_id", title: "titre", category: "categorie" },
  { sheet: "Partenaires", id: "partenaire_id", title: "nom", category: "categorie" },
  { sheet: "Ressources", id: "ressource_id", title: "titre", category: "categorie" },
  { sheet: "Programmes LO", id: "programme_id", title: "nom_programme", category: "niveau" },
];

const items = libraryMappings.flatMap(({ sheet, id, title, category }) => ((library as any)[sheet] as LibraryRow[]).map((row, index) => ({
  id: row[id] ? String(row[id]) : `${sheet}_${index}`,
})));

const ids = new Set();
for (const item of items) {
  if (ids.has(item.id)) {
    console.log("DUPLICATE FOUND:", item.id);
  }
  ids.add(item.id);
}
