import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
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

  if (user.role !== "ADMIN_B2B" && user.role !== "ADMIN_COLLECTIVITE" && user.role !== "ADMIN_B2B2C" && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const actions = await prisma.actionItem.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(actions);
}

export async function POST(request: Request) {
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

  if (user.role !== "ADMIN_B2B" && user.role !== "ADMIN_COLLECTIVITE" && user.role !== "ADMIN_B2B2C" && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, status, priority, pilot, dueDate, dimension } = body;

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
      organizationId: user.organizationId,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(newAction);
}
