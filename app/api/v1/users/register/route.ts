import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { prenom, nom, email, password } = await req.json();

    if (!prenom || !nom || !email || !password) {
      return NextResponse.json({ detail: "Tous les champs sont requis." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ detail: "Cet email est déjà utilisé." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: prenom,
        lastName: nom,
        email,
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
