import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.journalEntry.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Non trouvé ou non autorisé" }, { status: 404 });
    }

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: { content }
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error("[JOURNAL_PUT_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.journalEntry.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Non trouvé ou non autorisé" }, { status: 404 });
    }

    await prisma.journalEntry.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[JOURNAL_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
