import { NextResponse } from "next/server";
import { ResultService } from "@/lib/iqrh/result-service";
import { z } from "zod";
export async function POST(request: Request) { try { const { assessmentId } = z.object({ assessmentId: z.string().min(1) }).parse(await request.json()); return NextResponse.json(await ResultService.submit(assessmentId)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Soumission impossible." }, { status: 400 }); } }
