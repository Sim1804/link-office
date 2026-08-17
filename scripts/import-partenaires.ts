/**
 * @file import-partenaires.ts
 * @module scripts
 * @description Script d'importation des partenaires depuis le fichier source de documentation.
 * 
 * Lit `Documentation/Partenaire_LINK_OFFICE_V1.csv` et peuple la table `LibraryItem`
 * avec les partenaires qualifiés, afin qu'ils puissent être recommandés dans l'ordonnance relationnelle.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(process.cwd(), "Documentation", "Partenaire_LINK_OFFICE_V1.csv");
  console.log(`Lecture du fichier ${csvPath}...`);
  
  if (!fs.existsSync(csvPath)) {
    console.error("❌ Fichier introuvable. Vérifiez que Partenaire_LINK_OFFICE_V1.csv se trouve bien dans le dossier Documentation.");
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  // Séparation par ligne en gérant les sauts de ligne Windows (\r\n) et Unix (\n)
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
  
  if (lines.length === 0) {
    console.log("Le fichier est vide.");
    return;
  }
  
  const rawHeaders = lines[0].split(";");
  const headers = rawHeaders.map((h) => h.trim());
  
  const items = [];
  
  for (let i = 1; i < lines.length; i++) {
    // Attention aux colonnes contenant potentiellement des points-virgules,
    // mais dans ce fichier ils semblent tous bien formés selon un split basique ou encadrés de guillemets.
    // Un parseur complet serait idéal, mais pour cette tâche spécifique une regex avancée suffira
    // si des guillemets englobent des points-virgules.
    
    // Expression régulière pour splitter par ; tout en ignorant ceux à l'intérieur des guillemets
    const rawCols = lines[i].match(/(?:^|;)("(?:[^"]|"")*"|[^;]*)/g)?.map(val => val.replace(/^;?/, '').replace(/^"(.*)"$/, '$1').trim()) || [];
    
    const data: Record<string, string | null> = {};
    
    headers.forEach((h, index) => {
      if (h && h.length > 0) {
        data[h] = rawCols[index] ? rawCols[index].trim() : null;
      }
    });
    
    const partenaireId = data["partenaire_id"];
    const nom = data["nom"];
    const categorie = data["categorie"];
    
    // Ignorer les lignes vides ou incomplètes à la fin du fichier
    if (partenaireId && nom) {
      items.push({
        id: partenaireId,
        library: "Partenaires",
        title: nom,
        category: categorie || null,
        data: data
      });
    }
  }
  
  console.log(`${items.length} partenaires trouvés. Nettoyage des existants et insertion...`);
  
  // Suppression des anciens partenaires de la base
  await prisma.libraryItem.deleteMany({
    where: { library: "Partenaires" }
  });
  
  // Insertion des nouveaux
  await prisma.libraryItem.createMany({
    data: items
  });
  
  console.log(`✅ ${items.length} partenaires insérés avec succès dans la table LibraryItem !`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de l'import :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
