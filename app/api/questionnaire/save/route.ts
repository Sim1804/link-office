import { NextResponse } from "next/server";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
export async function POST(request: Request) { try { return NextResponse.json(await QuestionnaireService.save(await request.json())); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Sauvegarde impossible." }, { status: 400 }); } }
