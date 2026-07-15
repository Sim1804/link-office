import { NextResponse } from "next/server";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
import { startSchema } from "@/lib/iqrh/schemas";
export async function POST(request: Request) { try { const { userId } = startSchema.parse(await request.json()); return NextResponse.json(await QuestionnaireService.start(userId)); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); } }
