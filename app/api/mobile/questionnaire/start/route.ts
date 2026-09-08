import { NextResponse } from "next/server";
import { z } from "zod";
import { getMobileUser } from "@/lib/mobile-auth";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
const schema = z.object({ userId: z.string().min(1) });
export async function POST(request: Request) { const user = await getMobileUser(request); if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); const { userId } = schema.parse(await request.json()); if (userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 }); return NextResponse.json(await QuestionnaireService.start(user.id)); }
