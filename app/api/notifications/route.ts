import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NotificationService } from "@/lib/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await NotificationService.getUnread(session.user.id);
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
