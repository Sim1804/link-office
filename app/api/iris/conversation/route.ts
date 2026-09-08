/**
 * @file route.ts
 * @module app/api/iris/conversation
 * @description Route API pour initialiser une nouvelle conversation avec IRIS.
 *
 * Cette route génère un identifiant unique de conversation qui est ensuite
 * utilisé comme paramètre d'URL pour les messages suivants
 * (`/api/iris/conversation/[id]/message`).
 *
 * NOTE D'ARCHITECTURE : L'historique de la conversation est actuellement géré
 * côté client (envoyé à chaque requête via `history`). Si une persistance BDD
 * est souhaitée (historique multi-sessions), il faudra créer un modèle Prisma
 * `Conversation` et l'associer à `userId`.
 *
 * @method POST
 * @returns {{ conversation_id: string }} — L'ID unique de la session de conversation
 * @throws {401} Si l'utilisateur n'est pas authentifié
 * @throws {500} En cas d'erreur interne
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";

/**
 * Démarre une nouvelle session de conversation IRIS et retourne son identifiant unique.
 * L'ID est utilisé pour router les messages suivants vers `/[id]/message`.
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

    // Génération d'un ID de conversation unique combinant timestamp et UUID
    const conversationId = `conv_${Date.now()}_${randomUUID()}`;
    return NextResponse.json({ conversation_id: conversationId });

  } catch (error) {
    console.error("[IRIS_CONVERSATION_START_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
