/**
 * @file route.ts
 * @module app/api/iris/conversation
 * @description Route API pour initialiser une nouvelle conversation IRIS persistée en base de données.
 *
 * Contrairement à l'ancienne implémentation (ID UUID en mémoire uniquement),
 * cette version crée un enregistrement `IrisConversation` en BDD, ce qui permet :
 * - La persistance multi-sessions (rechargement de page, changement d'appareil)
 * - L'affichage de l'historique des conversations passées
 * - Le contexte continu entre les sessions de coaching
 *
 * @method POST
 * @returns {{ conversation_id: string }} — L'ID Prisma de la conversation créée
 * @throws {401} Si l'utilisateur n'est pas authentifié
 * @throws {500} En cas d'erreur interne
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Démarre une nouvelle session de conversation IRIS et la persiste en base de données.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour démarrer une conversation IRIS." },
        { status: 401 }
      );
    }

    const conversation = await prisma.irisConversation.create({
      data: { userId: session.user.id },
    });

    return NextResponse.json({ conversation_id: conversation.id });

  } catch (error) {
    console.error("[IRIS_CONVERSATION_START_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * Récupère la liste des conversations IRIS d'un utilisateur (pour un éventuel historique UI).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const conversations = await prisma.irisConversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("[IRIS_CONVERSATION_LIST_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
