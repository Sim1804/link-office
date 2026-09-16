import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createMobileToken } from "@/lib/mobile-auth";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";
const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!rateLimit(`mobile-login:${ip}`, { limit: 10, windowMs: 60_000 })) return NextResponse.json({ error: `Trop de tentatives. Réessayez dans ${Math.ceil(getRetryAfterSeconds(`mobile-login:${ip}`) / 60)} minute(s).` }, { status: 429 });
  try {
    const { email: rawEmail, password } = schema.parse(await request.json());
    const email = rawEmail.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, firstName: true, lastName: true, password: true, role: true, organizationId: true, mustChangePassword: true } });
    if (!user?.password || !(await bcrypt.compare(password, user.password))) return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
    const token = await createMobileToken(user);
    return NextResponse.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, organizationId: user.organizationId, mustChangePassword: user.mustChangePassword } });
  }  catch (error) {
  console.error("MOBILE LOGIN ERROR:", error);

  return NextResponse.json(
    {
      error:
        error instanceof z.ZodError
          ? "Identifiants invalides."
          : "Erreur interne.",
    },
    { status: error instanceof z.ZodError ? 400 : 500 }
  );
}
}
