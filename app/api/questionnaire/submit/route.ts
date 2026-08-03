import { NextResponse } from "next/server";
import { ResultService } from "@/lib/iqrh/result-service";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const submitSchema = z.object({
  assessmentId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour soumettre votre évaluation." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assessmentId } = submitSchema.parse(body);

    // Vérifier l'existence de l'évaluation et son propriétaire
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Évaluation introuvable." },
        { status: 404 }
      );
    }

    // Sécurité: Vérifier que l'utilisateur soumet bien SON évaluation
    if (assessment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès refusé. Vous ne pouvez pas soumettre cette évaluation." },
        { status: 403 }
      );
    }

    const result = await ResultService.submit(assessmentId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("SUBMIT ERROR:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides.", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Soumission impossible.",
        ...(process.env.NODE_ENV === "development" && error instanceof Error
          ? { stack: error.stack }
          : {}),
      },
      { status: 400 }
    );
  }
}