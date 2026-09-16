import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Dimension, QuestionKind } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const library = await req.json();

    // Verification basique
    if (!library || typeof library !== "object") {
      return NextResponse.json({ error: "Format JSON invalide" }, { status: 400 });
    }

    // 1. Mise à jour de la bibliothèque standard (LibraryItem)
    const allowedLibraries = ["Tags", "Besoins", "Facteurs", "Recommandations", "Micro-défis", "Partenaires", "Ressources", "Programmes LO"];
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

    const items = libraryMappings.flatMap(({ sheet, id, title, category }) => {
      if (!library[sheet]) return [];
      return (library[sheet] as any[]).map((row, index) => ({
        id: (sheet === "Tags" || !row[id]) ? `${sheet}_${index}` : String(row[id]),
        library: sheet,
        title: String(row[title]),
        category: category ? String(row[category] ?? "") : null,
        data: row,
      }));
    });

    if (items.length > 0) {
      // Pour éviter de casser des clés étrangères, on pourrait faire un upsert, mais deleteMany + createMany est l'approche actuelle de seed.ts
      await prisma.libraryItem.deleteMany();
      await prisma.libraryItem.createMany({ data: items });
    }

    // 2. Mise à jour des Questions IQRH
    if (library["Questions_IQRH"]) {
      const questionsIqrh = library["Questions_IQRH"] as any[];
      // Option Soft Delete (Archivage) au lieu de deleteMany
      // Pour cet exemple, on remplace tout comme dans le seed.ts pour rester consistant
      await prisma.questionnaireAnswer.deleteMany();
      await prisma.question.deleteMany();
      await prisma.question.createMany({
        data: questionsIqrh.map((q) => ({
          id: q.id,
          text: q.text,
          position: q.position,
          kind: QuestionKind.REFERENCE,
          dimension: q.dimension as Dimension,
          version: q.version || 1,
          isActive: q.isActive !== false,
        })),
      });
    }

    // 3. Mise à jour des Modules Adaptatifs
    if (library["Modules_Adaptatifs"]) {
      const modulesAdaptatifs = library["Modules_Adaptatifs"] as any[];
      await prisma.adaptiveAnswer.deleteMany();
      await prisma.adaptiveModule.deleteMany();
      for (const mod of modulesAdaptatifs) {
        await prisma.adaptiveModule.create({
          data: {
            id: mod.id,
            triggerSituation: mod.triggerSituation,
            title: mod.title,
            objective: mod.objective,
            position: mod.position,
            version: mod.version || 1,
            isActive: mod.isActive !== false,
            questions: {
              create: mod.questions.map((q: any) => ({
                id: q.id,
                position: q.position,
                text: q.text,
                version: q.version || 1,
                isActive: q.isActive !== false,
              })),
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Catalogue importé avec succès" });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/catalog/import :", error);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}
