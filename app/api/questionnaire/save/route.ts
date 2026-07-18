import { NextResponse } from "next/server";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
import { saveSchema } from "@/lib/iqrh/schemas";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const data = saveSchema.parse(body);

    // Vérifier l'existence de l'évaluation et son propriétaire
    const assessment = await prisma.assessment.findUnique({
      where: { id: data.assessmentId },
      select: { userId: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Évaluation introuvable." }, { status: 404 });
    }

    // Sécurité: Vérifier que l'utilisateur modifie bien SON évaluation
    if (!session?.user?.id && assessment.userId !== "demo-user") {
      return NextResponse.json({ error: "Non autorisé. Vous devez être connecté." }, { status: 401 });
    }
    if (session?.user?.id && assessment.userId !== session.user.id && assessment.userId !== "demo-user") {
      return NextResponse.json({ error: "Accès refusé. Vous ne pouvez pas modifier cette évaluation." }, { status: 403 });
    }

    const savedAssessment = await QuestionnaireService.save(data);
    return NextResponse.json(savedAssessment);
  } catch (error) {
    console.error("SAVE ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sauvegarde impossible." },
      { status: 400 }
    );
  }
}
