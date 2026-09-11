import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { weather, factors, note } = await req.json();

    if (!weather) {
      return NextResponse.json({ error: "Météo requise" }, { status: 400 });
    }

    const meteo = await prisma.meteoCheckin.create({
      data: {
        userId: session.user.id,
        weather,
        factors: factors || [],
        note
      }
    });

    return NextResponse.json({ success: true, meteo });
  } catch (error: any) {
    console.error("[METEO_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
