import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { content, dimension, lifeEventId, promptUsed } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        content,
        dimension,
        lifeEventId,
        promptUsed
      }
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error("[JOURNAL_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const entries = await prisma.journalEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" }
    });

    return NextResponse.json({ success: true, entries });
  } catch (error: any) {
    console.error("[JOURNAL_GET_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
