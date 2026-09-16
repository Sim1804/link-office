import { NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
export async function POST(request: Request) { const user = await getMobileUser(request); if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); return NextResponse.json(await QuestionnaireService.start(user.id)); }
