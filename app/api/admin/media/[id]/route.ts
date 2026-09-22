import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const resolvedParams = await params;
    const mediaId = resolvedParams.id;

    if (!mediaId) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // On supprime le média (les relations sont gérées par onDelete: Cascade dans le schéma)
    await prisma.mediaContent.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression média:", error);
    return NextResponse.json(
      { error: "Impossible de supprimer ce média" },
      { status: 500 }
    );
  }
}
