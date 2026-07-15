import { NextResponse } from "next/server";
import { PrescriptionService } from "@/lib/iqrh/prescription-service";

export async function GET(_: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const prescription = await PrescriptionService.byUser(userId);
    return NextResponse.json({ prescription });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur serveur" }, { status: 500 });
  }
}
