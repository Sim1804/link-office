import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { objective, dimension, rationale } = await req.json();

    if (!objective || !dimension) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    // Chercher le plan actif ou le créer
    let plan = await prisma.relationalPlan.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" }
    });

    if (!plan) {
      plan = await prisma.relationalPlan.create({
        data: { userId: session.user.id }
      });
    }

    const priority = await prisma.planPriority.create({
      data: {
        planId: plan.id,
        dimension,
        objective,
        rationale: rationale || ""
      }
    });

    return NextResponse.json({ success: true, priority });
  } catch (error: any) {
    console.error("[PLAN_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const plan = await prisma.relationalPlan.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: {
        priorities: {
          include: { actions: true }
        }
      }
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("[PLAN_GET_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
