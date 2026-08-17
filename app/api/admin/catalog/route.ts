import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createItemSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  library: z.string().min(1, "Le type de bibliothèque est requis"),
  title: z.string().min(1, "Le titre est requis"),
  category: z.string().nullable().optional(),
  data: z.any() // JSON
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const library = searchParams.get("library");

    const items = await prisma.libraryItem.findMany({
      where: library ? { library } : undefined,
      orderBy: { id: "asc" }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Erreur GET /api/admin/catalog :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const result = createItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Données invalides", details: result.error.format() }, { status: 400 });
    }

    const { id, library, title, category, data } = result.data;

    // Vérifier si l'ID existe déjà
    const existing = await prisma.libraryItem.findUnique({ where: { id } });
    if (existing) {
      return NextResponse.json({ error: "Un élément avec cet ID existe déjà" }, { status: 409 });
    }

    const newItem = await prisma.libraryItem.create({
      data: {
        id,
        library,
        title,
        category,
        data: data || {}
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/admin/catalog :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
