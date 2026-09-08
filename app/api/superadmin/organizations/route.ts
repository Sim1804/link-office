import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

// Mappage entre le type d'organisation et le role de l'admin
const mapTypeToRole = (type: string): UserRole => {
  switch (type) {
    case "B2B": return "ADMIN_B2B";
    case "B2B2C": return "ADMIN_B2B2C";
    case "COLLECTIVITE": return "ADMIN_COLLECTIVITE";
    default: return "ADMIN_B2B";
  }
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { campaigns: true, users: true } },
        users: { 
          where: { role: { in: ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_COLLECTIVITE"] } },
          select: { email: true, firstName: true, lastName: true },
          take: 1
        }
      }
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("GET /api/superadmin/organizations:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await req.json();
    const { 
      name, type, codeAccess, logoUrl, adminEmail, adminFirstName, adminLastName, adminPassword,
      contactName, contactEmail, contactPhone, contractType, startDate, endDate, targetPopulation, territory, quota 
    } = data;

    if (!name || !type || !codeAccess || !adminEmail || !adminFirstName || !adminLastName || !adminPassword) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    // Vérifier si le codeAccess est unique
    const existingOrg = await prisma.organization.findUnique({ where: { codeAccess } });
    if (existingOrg) {
      return NextResponse.json({ error: "Ce code d'accès est déjà utilisé" }, { status: 400 });
    }

    // Vérifier si l'email de l'admin existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "L'email de l'administrateur est déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminRole = mapTypeToRole(type);

    // Création transactionnelle de l'organisation et de l'utilisateur
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          type,
          codeAccess,
          logoUrl: logoUrl || null,
          contactName: contactName || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          contractType: contractType || null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          targetPopulation: targetPopulation ? parseInt(targetPopulation, 10) : null,
          territory: territory || null,
          quota: quota ? parseInt(quota, 10) : null,
        },
      });

      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          firstName: adminFirstName,
          lastName: adminLastName,
          password: hashedPassword,
          role: adminRole,
          organizationId: org.id,
          mustChangePassword: true, // Forcer le changement au premier login (pratique sécurisée)
        }
      });

      return { org, admin };
    });

    return NextResponse.json({ message: "Organisation créée avec succès", organization: result.org }, { status: 201 });
  } catch (error) {
    console.error("POST /api/superadmin/organizations:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
