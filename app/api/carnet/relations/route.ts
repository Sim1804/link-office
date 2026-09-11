import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, category, frequency, proximity, supportType } = await req.json();

    if (!name || !category) {
      return NextResponse.json({ error: "Nom et catégorie requis" }, { status: 400 });
    }

    const relation = await prisma.resourceRelation.create({
      data: {
        userId: session.user.id,
        name,
        category,
        frequency,
        proximity,
        supportType: supportType || []
      }
    });

    return NextResponse.json({ success: true, relation });
  } catch (error: any) {
    console.error("[RELATIONS_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const relations = await prisma.resourceRelation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, relations });
  } catch (error: any) {
    console.error("[RELATIONS_GET_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
