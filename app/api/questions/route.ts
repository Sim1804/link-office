import { NextResponse } from "next/server";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
export async function GET() { return NextResponse.json(await QuestionnaireService.getDefinition()); }
