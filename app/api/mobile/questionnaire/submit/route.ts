import { NextResponse } from "next/server";
import { z } from "zod";
import { getMobileUser } from "@/lib/mobile-auth";
import { ResultService } from "@/lib/iqrh/result-service";
import { prisma } from "@/lib/prisma";
const schema = z.object({ assessmentId: z.string().min(1) });
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { assessmentId } = schema.parse(await request.json());
    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId }, select: { userId: true } });
    if (!assessment) return NextResponse.json({ error: "Évaluation introuvable" }, { status: 404 });
    if (assessment.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    return NextResponse.json(await ResultService.submit(assessmentId));
  } catch (error) {
    console.error("MOBILE QUESTIONNAIRE SUBMIT ERROR:", error);
    return NextResponse.json(
      { error: error instanceof z.ZodError ? "Évaluation invalide." : "Impossible de finaliser votre évaluation." },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}
