import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrescriptionService } from "@/lib/iqrh/prescription-service";
import { auth } from "@/lib/auth";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Recherche par assessmentId ou par userId
    let assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        result: {
          include: {
            prescription: {
              include: {
                items: { orderBy: { position: "asc" }, include: { libraryItem: true } },
              },
            },
          },
        },
      },
    });

    let targetUserId = assessment?.userId;

    if (!assessment) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (user) {
        targetUserId = user.id;
        assessment = await prisma.assessment.findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          include: {
            result: {
              include: {
                prescription: {
                  include: {
                    items: { orderBy: { position: "asc" }, include: { libraryItem: true } },
                  },
                },
              },
            },
          },
        });
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "Évaluation introuvable." }, { status: 404 });
    }

    if (session.user.id !== targetUserId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    let prescription = assessment?.result?.prescription;
    if (!prescription) {
      prescription = (await PrescriptionService.byUser(targetUserId)) as any;
    }

    if (!prescription) {
      return NextResponse.json({ error: "Prescription introuvable." }, { status: 404 });
    }

    const filtered = await PrescriptionService.filterForUserPlan(prescription, targetUserId);
    const recommendations = filtered.items?.filter((i: any) => i.kind === "RECOMMENDATION") || [];
    const microDefis = filtered.items?.filter((i: any) => i.kind === "MICRO_CHALLENGE") || [];

    return NextResponse.json({
      prescription: filtered,
      items: filtered.items || [],
      recommendations,
      microDefis,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
