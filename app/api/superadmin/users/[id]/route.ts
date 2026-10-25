import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUserAccount } from "@/lib/user/account-service";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const updateData: any = {};
    if (body.subscription) updateData.subscription = body.subscription;
    if (body.role) updateData.role = body.role;
    if (body.organizationId !== undefined) {
      updateData.organizationId = body.organizationId ? body.organizationId : null;
    }
    if (body.campaignId !== undefined) {
      updateData.campaignId = body.campaignId ? body.campaignId : null;
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Règle d'or multi-tenant SaaS : Un SUPER_ADMIN représente l'opérateur plateforme global.
    // Il ne doit jamais être rattaché à un tenant client (Novatech, Mutuelle, etc.).
    if (existing.role === "SUPER_ADMIN" || body.role === "SUPER_ADMIN") {
      updateData.organizationId = null;
      updateData.campaignId = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscription: true,
        organizationId: true,
        campaignId: true,
        createdAt: true,
        isTwoFactorEnabled: true,
        mustChangePassword: true,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PATCH /api/superadmin/users/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await context.params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    await deleteUserAccount(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/superadmin/users/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
