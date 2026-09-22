import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: binomeId } = await params;
    const { satisfaction, usefulness, reciprocity, continuationIntent, issueReason } = await req.json();

    const binome = await prisma.binome.findUnique({
      where: { id: binomeId },
      include: { feedbacks: true }
    });

    if (!binome) {
      return NextResponse.json({ error: "Binôme introuvable" }, { status: 404 });
    }

    if (binome.userAId !== session.user.id && binome.userBId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Check if the user already provided feedback
    const existingFeedback = binome.feedbacks.find(f => f.userId === session.user.id);
    if (existingFeedback) {
      return NextResponse.json({ error: "Vous avez déjà soumis votre bilan" }, { status: 400 });
    }

    const feedback = await prisma.binomeFeedback.create({
      data: {
        binomeId,
        userId: session.user.id,
        satisfaction,
        usefulness,
        reciprocity,
        continuationIntent,
        issueReason,
      }
    });

    // Check if the other user has also provided feedback
    const otherUserFeedback = binome.feedbacks.find(f => f.userId !== session.user.id);

    // If both have given feedback, close the binome
    if (otherUserFeedback) {
      await prisma.binome.update({
        where: { id: binomeId },
        data: {
          status: "CLOSED",
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error("[BINOME_FEEDBACK_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
