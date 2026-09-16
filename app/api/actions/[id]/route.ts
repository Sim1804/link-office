import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Aucune organisation associée" }, { status: 404 });
    }

    if (!user.role.startsWith("ADMIN_") && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify the action belongs to the organization
    const existingAction = await prisma.actionItem.findUnique({
      where: { id },
    });

    if (!existingAction || existingAction.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Action introuvable ou non autorisée" }, { status: 404 });
    }

    const updatedAction = await prisma.actionItem.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        status: body.status !== undefined ? body.status : undefined,
        priority: body.priority !== undefined ? body.priority : undefined,
        pilot: body.pilot !== undefined ? body.pilot : undefined,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : undefined,
        dimension: body.dimension !== undefined ? body.dimension : undefined,
        campaignId: body.campaignId !== undefined ? body.campaignId : undefined,
      },
    });

    return NextResponse.json(updatedAction);
  } catch (error) {
    console.error("[ACTIONS_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Aucune organisation associée" }, { status: 404 });
    }

    if (!user.role.startsWith("ADMIN_") && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const { id } = await params;

    // Verify the action belongs to the organization
    const existingAction = await prisma.actionItem.findUnique({
      where: { id },
    });

    if (!existingAction || existingAction.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Action introuvable ou non autorisée" }, { status: 404 });
    }

    await prisma.actionItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ACTIONS_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur lors de la suppression" }, { status: 500 });
  }
}
