/**
 * @file route.ts
 * @module app/api/superadmin/platform/settings
 * @description API de gestion des paramètres globaux de la plateforme.
 *
 * Gère les feature flags et les paramètres système via la table SystemConfig.
 * Accès réservé au SUPER_ADMIN uniquement.
 *
 * Feature flags disponibles :
 * - iris_enabled : Active/désactive IRIS pour tous les utilisateurs
 * - binome_enabled : Active/désactive le module binôme
 * - questionnaire_enabled : Active/désactive l'accès au questionnaire
 * - registration_enabled : Active/désactive les nouvelles inscriptions
 * - maintenance_mode : Mode maintenance (redirige vers page d'info)
 *
 * @method GET — Retourne tous les paramètres plateforme
 * @method PATCH — Met à jour un ou plusieurs paramètres
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PLATFORM_CONFIG_KEY = "platform_settings";

/** Structure des paramètres plateforme */
export interface PlatformSettings {
  iris_enabled: boolean;
  binome_enabled: boolean;
  questionnaire_enabled: boolean;
  registration_enabled: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  max_users_per_org: number;
  updatedAt: string;
  updatedBy: string | null;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  iris_enabled: true,
  binome_enabled: true,
  questionnaire_enabled: true,
  registration_enabled: true,
  maintenance_mode: false,
  maintenance_message: "La plateforme est temporairement en maintenance. Merci de revenir dans quelques instants.",
  max_users_per_org: 5000,
  updatedAt: new Date().toISOString(),
  updatedBy: null,
};

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const record = await prisma.systemConfig.findUnique({
      where: { key: PLATFORM_CONFIG_KEY },
    });

    const settings: PlatformSettings =
      record?.value && typeof record.value === "object"
        ? { ...DEFAULT_SETTINGS, ...(record.value as Partial<PlatformSettings>) }
        : DEFAULT_SETTINGS;

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[SUPERADMIN_SETTINGS_GET]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();

    // Récupérer les paramètres actuels
    const record = await prisma.systemConfig.findUnique({
      where: { key: PLATFORM_CONFIG_KEY },
    });
    const current: PlatformSettings =
      record?.value && typeof record.value === "object"
        ? { ...DEFAULT_SETTINGS, ...(record.value as Partial<PlatformSettings>) }
        : DEFAULT_SETTINGS;

    // Validation des types (seulement les champs modifiables)
    const boolFields: (keyof PlatformSettings)[] = [
      "iris_enabled",
      "binome_enabled",
      "questionnaire_enabled",
      "registration_enabled",
      "maintenance_mode",
    ];

    const updated: PlatformSettings = { ...current };

    for (const field of boolFields) {
      if (body[field] !== undefined) {
        (updated as any)[field] = !!body[field];
      }
    }

    if (body.maintenance_message !== undefined) {
      if (typeof body.maintenance_message !== "string" || body.maintenance_message.length > 500) {
        return NextResponse.json(
          { error: "maintenance_message doit être une chaîne de 500 caractères max" },
          { status: 400 }
        );
      }
      updated.maintenance_message = body.maintenance_message;
    }

    if (body.max_users_per_org !== undefined) {
      const val = parseInt(body.max_users_per_org, 10);
      if (isNaN(val) || val < 1 || val > 100_000) {
        return NextResponse.json(
          { error: "max_users_per_org doit être entre 1 et 100 000" },
          { status: 400 }
        );
      }
      updated.max_users_per_org = val;
    }

    updated.updatedAt = new Date().toISOString();
    updated.updatedBy = session.user.id;

    await prisma.systemConfig.upsert({
      where: { key: PLATFORM_CONFIG_KEY },
      create: { key: PLATFORM_CONFIG_KEY, value: updated as any },
      update: { value: updated as any },
    });

    return NextResponse.json({
      message: "Paramètres mis à jour avec succès",
      settings: updated,
    });
  } catch (error) {
    console.error("[SUPERADMIN_SETTINGS_PATCH]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
