import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NotificationService } from "@/lib/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await NotificationService.getRecent(session.user.id);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[Notifications API] Erreur lors de la récupération :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (body.all) {
      await NotificationService.markAllAsRead(session.user.id);
      return NextResponse.json({ success: true, all: true });
    }

    if (body.id) {
      await NotificationService.markAsRead(body.id, session.user.id);
      return NextResponse.json({ success: true, id: body.id });
    }

    return NextResponse.json({ error: "Paramètres manquants : 'id' ou 'all' requis" }, { status: 400 });
  } catch (error) {
    console.error("[Notifications API] Erreur lors du marquage comme lu :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}

