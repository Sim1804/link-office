import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
export async function POST(request: Request) { const user = await getMobileUser(request); if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); const { password } = await request.json(); if (typeof password !== "string" || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return NextResponse.json({ error: "Le mot de passe doit contenir 8 caractères, une majuscule et un chiffre." }, { status: 400 }); await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(password, 12), mustChangePassword: false } }); return NextResponse.json({ success: true }); }
