import { NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request) { const user = await getMobileUser(request); if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); const assessment = await prisma.assessment.findFirst({ where: { userId: user.id }, orderBy: { startedAt: "desc" }, include: { demographic: true, result: true } }); return NextResponse.json({ hasConsent: !!assessment && (assessment.consentInformation || assessment.consentResearch), hasCompletedDemographics: !!assessment?.demographic, hasCompletedIqrh: assessment?.status === "SUBMITTED" || !!assessment?.result }); }
