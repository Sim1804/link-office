import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { matchingOptIn: true }
  });

  return NextResponse.json(user);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (typeof body.matchingOptIn !== "boolean") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { matchingOptIn: body.matchingOptIn }
  });

  return NextResponse.json({ success: true, matchingOptIn: body.matchingOptIn });
}
