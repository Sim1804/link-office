/**
 * @file route.ts
 * @module app/api/iris/conversation/active
 * @description Récupère la conversation active la plus récente et ses messages pour assurer la continuité du dialogue.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer la conversation la plus récente de l'utilisateur avec ses messages (jusqu'à 7 jours d'inactivité)
    const activeConversation = await prisma.irisConversation.findFirst({
      where: {
        userId,
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 40,
          select: { id: true, role: true, content: true, createdAt: true },
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const isOrgAdmin = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G", "ADMIN_COLLECTIVITE"].includes(user?.role || "");

    // Vérifier si l'utilisateur possède un bilan IQRH complété avec résultats (non applicable à SUPER_ADMIN)
    const hasCompletedAssessment = isSuperAdmin
      ? false
      : await prisma.assessment.findFirst({
          where: {
            userId,
            result: { isNot: null },
          },
          select: { id: true },
        }).then(res => !!res);

    if (!activeConversation || activeConversation.messages.length === 0) {
      return NextResponse.json({
        conversation: null,
        hasCompletedAssessment,
        userRole: user?.role,
        isSuperAdmin,
        isOrgAdmin,
      });
    }

    return NextResponse.json({
      conversation: {
        id: activeConversation.id,
        messages: activeConversation.messages.map((m) => ({
          id: m.id,
          sender: m.role === "assistant" ? "iris" : "user",
          text: m.content,
          timestamp: m.createdAt,
        })),
      },
      hasCompletedAssessment,
      userRole: user?.role,
      isSuperAdmin,
      isOrgAdmin,
    });
  } catch (error) {
    console.error("[IRIS_ACTIVE_CONVERSATION_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
