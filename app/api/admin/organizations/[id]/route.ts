import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        campaigns: {
          orderBy: { startDate: 'desc' }
        }
      }
    });

    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(org);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
