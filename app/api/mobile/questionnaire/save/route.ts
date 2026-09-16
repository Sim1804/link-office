import { NextResponse } from "next/server";
import { z } from "zod";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ assessmentId: z.string().min(1), questionId: z.string().min(1), value: z.number().int().min(1).max(5) });
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const data = schema.parse(await request.json());
    const assessment = await prisma.assessment.findUnique({ where: { id: data.assessmentId }, select: { userId: true } });
    if (!assessment) return NextResponse.json({ error: "Évaluation introuvable" }, { status: 404 });
    if (assessment.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const question = await prisma.question.findUnique({ where: { id: data.questionId }, select: { id: true } });
    if (!question) return NextResponse.json({ error: "Question introuvable" }, { status: 404 });

    const answer = await prisma.questionnaireAnswer.upsert({
      where: { assessmentId_questionId: { assessmentId: data.assessmentId, questionId: data.questionId } },
      create: data,
      update: { value: data.value },
    });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("MOBILE QUESTIONNAIRE SAVE ERROR:", error);
    return NextResponse.json(
      { error: error instanceof z.ZodError ? "Réponse invalide." : "Impossible d'enregistrer votre réponse." },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}
