import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { date, category, impact, description } = await req.json();

    if (!date || !category || !impact) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const lifeEvent = await prisma.lifeEvent.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        category,
        impact,
        description
      }
    });

    return NextResponse.json({ success: true, lifeEvent });
  } catch (error: any) {
    console.error("[LIFE_EVENT_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
