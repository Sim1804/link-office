import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
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

    if (user.role !== "ADMIN_B2B" && user.role !== "ADMIN_B2G" && user.role !== "ADMIN_B2B2C" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    const whereClause: any = { organizationId: user.organizationId };
    if (campaignId && campaignId !== "ALL") {
      whereClause.campaignId = campaignId;
    }

    const actions = await prisma.actionItem.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        Campaign: { select: { title: true } },
      }
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error("[ACTIONS_GET_ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    if (user.role !== "ADMIN_B2B" && user.role !== "ADMIN_B2G" && user.role !== "ADMIN_B2B2C" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, status, priority, pilot, dueDate, dimension, campaignId } = body;

    if (!title) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    }

    const newAction = await prisma.actionItem.create({
      data: {
        title,
        description,
        status: status || "PROPOSEE",
        priority: priority || "MEDIUM",
        pilot,
        dueDate: dueDate ? new Date(dueDate) : null,
        dimension,
        campaignId: campaignId || null,
        organizationId: user.organizationId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(newAction);
  } catch (error) {
    console.error("[ACTIONS_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur lors de la création" }, { status: 500 });
  }
}
