import { NextResponse } from "next/server";
import { z } from "zod";
import { getMobileUser } from "@/lib/mobile-auth";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
import { prisma } from "@/lib/prisma";
const schema = z.object({ assessmentId: z.string().min(1), questionId: z.string().min(1), value: z.number().int().min(1).max(5) });
export async function POST(request: Request) { const user = await getMobileUser(request); if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); const data = schema.parse(await request.json()); const assessment = await prisma.assessment.findUnique({ where: { id: data.assessmentId }, select: { userId: true } }); if (!assessment) return NextResponse.json({ error: "Évaluation introuvable" }, { status: 404 }); if (assessment.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); return NextResponse.json(await QuestionnaireService.save(data)); }
