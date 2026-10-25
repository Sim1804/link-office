import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkDistributedRateLimit } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const clientIP =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Anti-DoS CPU : Max 5 créations de compte par minute par IP
    const rateLimit = await checkDistributedRateLimit(`register:${clientIP}`, { limit: 5, windowMs: 60_000 });
    if (!rateLimit.success) {
      return NextResponse.json({ detail: "Trop de tentatives. Veuillez patienter avant de réessayer." }, { status: 429 });
    }

    const { prenom, nom, email, password } = await req.json();

    if (!prenom || !nom || !email || !password) {
      return NextResponse.json({ detail: "Tous les champs sont requis." }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 255) {
      return NextResponse.json({ detail: "Adresse email invalide." }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ detail: "Le mot de passe doit comporter au moins 8 caractères." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ detail: "Cet email est déjà utilisé." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: String(prenom).trim().slice(0, 50),
        lastName: String(nom).trim().slice(0, 50),
        email: cleanEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      prenom: user.firstName,
      nom: user.lastName,
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json({ detail: "Erreur interne du serveur." }, { status: 500 });
  }
}
