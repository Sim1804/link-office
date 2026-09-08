import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!["ADMIN_B2B","ADMIN_COLLECTIVITE","SUPER_ADMIN"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const invites = await prisma.campaignInvite.findMany({
      where: { campaignId: id },
      orderBy: { invitedAt: "desc" },
      select: { id: true, email: true, status: true, invitedAt: true, updatedAt: true },
    });

    // Compteurs globaux uniquement (jamais les noms individuels)
    const stats = {
      total: invites.length,
      invited:   invites.filter(i => i.status === "INVITED").length,
      activated: invites.filter(i => i.status === "ACTIVATED").length,
      started:   invites.filter(i => i.status === "STARTED").length,
      completed: invites.filter(i => i.status === "COMPLETED").length,
    };

    return NextResponse.json({ invites, stats });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Erreur serveur" }, { status: 500 }); }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!["ADMIN_B2B","ADMIN_COLLECTIVITE","SUPER_ADMIN"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });

    const { emails } = await req.json();
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Liste d emails vide" }, { status: 400 });
    }

    const validEmails = emails.filter((e: string) => typeof e === "string" && e.includes("@"));
    const results = { created: 0, duplicates: 0, errors: 0 };

    for (const email of validEmails) {
      try {
        await prisma.campaignInvite.create({ data: { campaignId: id, email: email.toLowerCase().trim() } });
        results.created++;
      } catch {
        results.duplicates++;
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Erreur serveur" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!["ADMIN_B2B","ADMIN_COLLECTIVITE","SUPER_ADMIN"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }
    const { email } = await req.json();
    await prisma.campaignInvite.deleteMany({ where: { campaignId: id, email } });
    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Erreur serveur" }, { status: 500 }); }
}