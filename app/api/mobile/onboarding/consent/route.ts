import { NextResponse } from "next/server";
import { z } from "zod";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ consentInformation: z.boolean(), consentResearch: z.boolean(), consentParticipation: z.boolean() });
export async function POST(request: Request) { const user = await getMobileUser(request); if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); const body = schema.parse(await request.json()); const current = await prisma.assessment.findFirst({ where: { userId: user.id }, orderBy: { startedAt: "desc" } }); const assessment = current ? await prisma.assessment.update({ where: { id: current.id }, data: { consentInformation: body.consentInformation, consentResearch: body.consentResearch, consentParticipation: body.consentParticipation } }) : await prisma.assessment.create({ data: { userId: user.id, consentInformation: body.consentInformation, consentResearch: body.consentResearch, consentParticipation: body.consentParticipation } }); return NextResponse.json({ assessmentId: assessment.id }); }
