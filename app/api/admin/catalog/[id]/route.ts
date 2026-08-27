import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateItemSchema = z.object({
  library: z.string().min(1),
  title: z.string().min(1),
  category: z.string().nullable().optional(),
  data: z.any() // JSON
});

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const result = updateItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Données invalides", details: result.error.format() }, { status: 400 });
    }

    const { library, title, category, data } = result.data;

    const updatedItem = await prisma.$transaction(async (tx) => {
      const libItem = await tx.libraryItem.update({
        where: { id },
        data: {
          library,
          title,
          category,
          data: data || {}
        }
      });

      const parseArray = (str: any) => {
        if (!str) return [];
        if (Array.isArray(str)) return str;
        return typeof str === 'string' ? str.split(';').map(s => s.trim()).filter(Boolean) : [];
      };

      if (library === "Recommandations") {
        await tx.recommendation.upsert({
          where: { id },
          update: {
            title, 
            category: category || null,
            dimensions: parseArray(data.dimensions_ciblees),
            profiles: parseArray(data.profils_cibles),
            situations: parseArray(data.situations_ciblees),
            riskFactors: parseArray(data.facteurs_risque_cibles),
            protectiveFactors: parseArray(data.facteurs_protecteurs_developpes),
            needs: parseArray(data.besoins_couverts),
            priorityLevel: data.niveau_priorite || null,
            difficulty: data.difficulte || null,
            estimatedTime: data.temps_estime || null,
            expectedImpact: data.impact_attendu_1_5 ? parseInt(String(data.impact_attendu_1_5)) || null : null,
            resultDelay: data.delai_resultat || null,
            frequency: data.frequence || null,
            programmes: parseArray(data.programmes_link_office_associes),
            partners: parseArray(data.partenaires_associes),
            displayText: data.texte_affiche || ""
          },
          create: {
            id, 
            title, 
            category: category || null,
            dimensions: parseArray(data.dimensions_ciblees),
            profiles: parseArray(data.profils_cibles),
            situations: parseArray(data.situations_ciblees),
            riskFactors: parseArray(data.facteurs_risque_cibles),
            protectiveFactors: parseArray(data.facteurs_protecteurs_developpes),
            needs: parseArray(data.besoins_couverts),
            priorityLevel: data.niveau_priorite || null,
            difficulty: data.difficulte || null,
            estimatedTime: data.temps_estime || null,
            expectedImpact: data.impact_attendu_1_5 ? parseInt(String(data.impact_attendu_1_5)) || null : null,
            resultDelay: data.delai_resultat || null,
            frequency: data.frequence || null,
            programmes: parseArray(data.programmes_link_office_associes),
            partners: parseArray(data.partenaires_associes),
            displayText: data.texte_affiche || ""
          }
        });
      } else if (library === "Micro-défis") {
        await tx.microDefi.upsert({
          where: { id },
          update: {
            title, 
            category: category || null,
            description: data.description || "",
            dimension: data.dimension_ciblee || null,
            need: data.besoin_cible || null,
            public: data.public_cible || null,
            difficulty: data.difficulte || null,
            estimatedTime: data.temps_estime || null,
            points: data.points ? parseInt(String(data.points)) || null : null,
            expectedImpact: data.impact_attendu_1_5 ? parseInt(String(data.impact_attendu_1_5)) || null : null,
            compatibleBinome: String(data.compatible_binome).toLowerCase().includes("oui") || data.compatible_binome === true,
            compatibleIris: String(data.compatible_iris).toLowerCase().includes("oui") || data.compatible_iris === true,
            expectedValidation: data.validation_attendue || null,
            notificationText: data.texte_notification || null,
          },
          create: {
            id, 
            title, 
            category: category || null,
            description: data.description || "",
            dimension: data.dimension_ciblee || null,
            need: data.besoin_cible || null,
            public: data.public_cible || null,
            difficulty: data.difficulte || null,
            estimatedTime: data.temps_estime || null,
            points: data.points ? parseInt(String(data.points)) || null : null,
            expectedImpact: data.impact_attendu_1_5 ? parseInt(String(data.impact_attendu_1_5)) || null : null,
            compatibleBinome: String(data.compatible_binome).toLowerCase().includes("oui") || data.compatible_binome === true,
            compatibleIris: String(data.compatible_iris).toLowerCase().includes("oui") || data.compatible_iris === true,
            expectedValidation: data.validation_attendue || null,
            notificationText: data.texte_notification || null,
          }
        });
      } else if (library === "Partenaires") {
        await tx.partnerMatching.upsert({
          where: { id },
          update: {
            partnerName: title, 
            category: category || null,
            publics: parseArray(data.public_cible),
            territories: parseArray(data.territoire),
            needs: parseArray(data.besoins_couverts),
            situations: parseArray(data.situations_ciblees),
            validation: data.niveau_validation || null,
          },
          create: {
            id, 
            partnerName: title, 
            category: category || null,
            publics: parseArray(data.public_cible),
            territories: parseArray(data.territoire),
            needs: parseArray(data.besoins_couverts),
            situations: parseArray(data.situations_ciblees),
            validation: data.niveau_validation || null,
          }
        });
      }

      return libItem;
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error("Erreur PUT /api/admin/catalog/[id] :", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Élément introuvable" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = params;

    await prisma.$transaction(async (tx) => {
      const item = await tx.libraryItem.findUnique({ where: { id } });
      if (item) {
        if (item.library === "Recommandations") await tx.recommendation.deleteMany({ where: { id } });
        if (item.library === "Micro-défis") await tx.microDefi.deleteMany({ where: { id } });
        if (item.library === "Partenaires") await tx.partnerMatching.deleteMany({ where: { id } });
      }
      await tx.libraryItem.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur DELETE /api/admin/catalog/[id] :", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Élément introuvable" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
