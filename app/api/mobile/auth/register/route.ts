import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

const schema = z.object({
  prenom: z.string().min(1).max(50), nom: z.string().min(1).max(50), email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/), codeAccess: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!rateLimit(`mobile-register:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 })) return NextResponse.json({ error: `Trop de tentatives. Réessayez dans ${Math.ceil(getRetryAfterSeconds(`mobile-register:${ip}`) / 60)} minute(s).` }, { status: 429 });
  try {
    const { prenom, nom, email, password, codeAccess } = schema.parse(await request.json());
    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    let organizationId: string | null = null; let campaignId: string | null = null; let subscription: any = undefined; let role: any = "EMPLOYEE";
    if (codeAccess) {
      const campaign = await prisma.campaign.findUnique({ where: { id: codeAccess }, select: { id: true, organizationId: true, offer: true } });
      if (campaign) { organizationId = campaign.organizationId; campaignId = campaign.id; subscription = campaign.offer; }
      else { const org = await prisma.organization.findUnique({ where: { codeAccess }, select: { id: true, type: true } }); if (org) { organizationId = org.id; role = org.type === "B2B2C" ? "MEMBER" : org.type === "COLLECTIVITE" ? "CITIZEN" : "EMPLOYEE"; } }
    }
    const user = await prisma.user.create({ data: { firstName: prenom, lastName: nom, email, password: await bcrypt.hash(password, 12), organizationId, campaignId, ...(subscription ? { subscription } : {}), role }, select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true, mustChangePassword: true } });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? "Données d'inscription invalides." : "Erreur interne." }, { status: 400 }); }
}
