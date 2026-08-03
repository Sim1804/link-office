import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GamificationService } from "@/lib/gamification/gamification-service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { prescriptionItemId } = body;

    if (!prescriptionItemId) {
      return NextResponse.json({ error: "L'identifiant du défi est requis." }, { status: 400 });
    }

    const result = await GamificationService.completeChallenge(session.user.id, prescriptionItemId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[GAMIFICATION_COMPLETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}
