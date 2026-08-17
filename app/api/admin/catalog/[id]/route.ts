import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateItemSchema = z.object({
  library: z.string().min(1),
  title: z.string().min(1),
  category: z.string().nullable().optional(),
  data: z.any() // JSON
});

import { NextRequest } from "next/server";

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

    const updatedItem = await prisma.libraryItem.update({
      where: { id },
      data: {
        library,
        title,
        category,
        data: data || {}
      }
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

    await prisma.libraryItem.delete({
      where: { id }
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
