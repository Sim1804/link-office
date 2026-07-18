import { NextResponse } from "next/server";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
import { startSchema } from "@/lib/iqrh/schemas";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { userId } = startSchema.parse(body);

    // Sécurité: Vérifier que l'utilisateur est authentifié
    // On conserve une exception pour le mode "demo-user" en dev.
    if (!session?.user?.id && userId !== "demo-user") {
      return NextResponse.json({ error: "Non autorisé. Vous devez être connecté." }, { status: 401 });
    }

    // Sécurité: Vérifier que l'utilisateur n'usurpe pas l'identité d'un autre
    if (session?.user?.id && userId !== session.user.id && userId !== "demo-user") {
      return NextResponse.json({ error: "Accès refusé. Action non permise." }, { status: 403 });
    }

    const assessment = await QuestionnaireService.start(userId);
    return NextResponse.json(assessment);
  } catch (error) {
    console.error("START ERROR:", error);
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
