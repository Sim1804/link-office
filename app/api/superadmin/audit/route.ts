/**
 * @file route.ts
 * @module app/api/superadmin/audit
 * @description API de consultation du journal d'audit superadmin.
 *
 * Expose le journal des événements système filtrés sur les actions d'administration :
 * - Changements de configuration LLM
 * - Connexions/déconnexions superadmin
 * - Modifications d'organisations et d'utilisateurs
 *
 * Accès réservé au SUPER_ADMIN uniquement.
 *
 * @method GET — Retourne les événements d'audit avec pagination et filtres
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AUDIT_EVENT_TYPES = [
  "iris_llm_inference",
  "iris_llm_degraded_fallback",
  "iris_llm_stream_finished",
  "superadmin_llm_config_updated",
  "superadmin_settings_updated",
];

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));
    const eventType = searchParams.get("eventType");
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {};

    // Filtrer sur les types d'événements d'audit
    if (eventType && AUDIT_EVENT_TYPES.includes(eventType)) {
      where.eventType = eventType;
    } else {
      where.eventType = { in: AUDIT_EVENT_TYPES };
    }

    if (userId) where.userId = userId;

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [events, total] = await Promise.all([
      prisma.eventLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.eventLog.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[SUPERADMIN_AUDIT_GET]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
