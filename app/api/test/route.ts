import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResultService } from "@/lib/iqrh/result-service";

export async function GET() {
  try {
    const user = await prisma.user.upsert({
      where: { email: "test-submit@example.com" },
      update: {},
      create: {
        email: "test-submit@example.com",
        firstName: "Test",
        lastName: "Submit",
        password: "test",
      }
    });

    // Create a dummy assessment
    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        consentInformation: true,
        consentResearch: true,
        consentParticipation: true,
        demographic: {
          create: {
            gender: "Homme",
            ageRange: "30-39",
            country: "France",
            department: "75",
            occupation: "Salarié",
            organizationSize: "50-249",
            relationshipStatus: "Célibataire",
            children: false,
            livingSituation: "Seul(e)",
            selectedSituations: ["Célibataire"],
            primarySituation: "Célibataire",
          }
        },
        answers: {
          create: Array.from({ length: 30 }).map((_, i) => ({
            questionId: `Q${i + 1}`,
            value: 4,
          }))
        }
      }
    });

    const finalResult = await ResultService.submit(assessment.id);
    return NextResponse.json({ success: true, finalResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
