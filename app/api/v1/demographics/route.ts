import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const assessment = await prisma.assessment.findFirst({
      where: { userId: session.user.id },
      include: { demographic: true, campaign: true },
      orderBy: { startedAt: "desc" }
    });

    const allSituations = await prisma.adaptiveModule.findMany({
      select: { triggerSituation: true }
    });

    const situationsList = allSituations.map(s => s.triggerSituation);

    if (!assessment || !assessment.demographic) {
      return NextResponse.json({ 
        demographic: null, 
        campaignConfig: assessment?.campaign?.questionnaireConfig || null,
        availableSituations: situationsList 
      });
    }

    return NextResponse.json({ 
      demographic: assessment.demographic, 
      campaignConfig: assessment.campaign?.questionnaireConfig || null,
      availableSituations: situationsList
    });
  } catch (error) {
    console.error("GET demographics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    let assessment = await prisma.assessment.findFirst({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" }
    });

    if (!assessment) {
        assessment = await prisma.assessment.create({
            data: { userId: session.user.id, status: "DRAFT" }
        });
    }

    const upserted = await prisma.demographicProfile.upsert({
      where: { assessmentId: assessment.id },
      update: {
        gender: body.gender,
        ageRange: body.ageRange,
        country: body.country,
        department: body.department,
        occupation: body.occupation,
        organizationSize: body.organizationSize,
        relationshipStatus: body.relationshipStatus,
        children: body.children,
        childrenCount: body.childrenCount,
        livingSituation: body.livingSituation,
        livingSituationOther: body.livingSituationOther,
        selectedSituations: body.selectedSituations,
        primarySituation: body.primarySituation,
      },
      create: {
        assessmentId: assessment.id,
        gender: body.gender,
        ageRange: body.ageRange,
        country: body.country,
        department: body.department,
        occupation: body.occupation,
        organizationSize: body.organizationSize,
        relationshipStatus: body.relationshipStatus,
        children: body.children,
        childrenCount: body.childrenCount,
        livingSituation: body.livingSituation,
        livingSituationOther: body.livingSituationOther,
        selectedSituations: body.selectedSituations,
        primarySituation: body.primarySituation,
      }
    });

    return NextResponse.json({ demographic: upserted });
  } catch (error) {
    console.error("POST demographics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
