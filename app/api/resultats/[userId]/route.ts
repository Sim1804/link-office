import { NextResponse } from "next/server";
import { ResultService } from "@/lib/iqrh/result-service";
export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) { try { return NextResponse.json(await ResultService.byUser((await params).userId)); } catch { return NextResponse.json({ error: "Résultat introuvable." }, { status: 404 }); } }
