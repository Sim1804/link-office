import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCronSecret } from "@/lib/cron";

export async function GET(request: Request) {
  try {
    // Vérification de sécurité obligatoire à temps constant via Authorization Bearer
    if (!validateCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const retentionDays = parseInt(process.env.IRIS_TRANSCRIPT_RETENTION_DAYS || "90", 10);
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    // Recherche des conversations antérieures à la date limite
    const oldConversations = await prisma.irisConversation.findMany({
      where: { createdAt: { lt: cutoffDate } },
      select: { id: true },
    });

    const oldConvIds = oldConversations.map((c) => c.id);

    // Suppression des messages rattachés
    const deletedMessages = await prisma.irisMessage.deleteMany({
      where: {
        OR: [
          { conversationId: { in: oldConvIds } },
          { createdAt: { lt: cutoffDate } },
        ],
      },
    });

    // Suppression des conversations
    const deletedConversations = await prisma.irisConversation.deleteMany({
      where: {
        OR: [
          { id: { in: oldConvIds } },
          { createdAt: { lt: cutoffDate } },
        ],
      },
    });

    // Journalisation du nombre de lignes supprimées (strictement sans contenu)
    console.log(
      `[CRON_CLEANUP] Rétention ${retentionDays} jours : ${deletedConversations.count} conversation(s) et ${deletedMessages.count} message(s) purgés.`
    );

    return NextResponse.json({
      success: true,
      retentionDays,
      deletedConversations: deletedConversations.count,
      deletedMessages: deletedMessages.count,
    });
  } catch (error) {
    console.error("[CRON_CLEANUP_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
