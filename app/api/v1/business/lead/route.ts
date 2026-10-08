import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const VALID_PLANS = ["B2B_ENTREPRISE", "B2G", "B2B2C_PARTENAIRE"] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      plan, 
      organization, 
      contactName, 
      email, 
      phone, 
      companySize, 
      populationSize, 
      beneficiaries,
      website_trap // Honeypot anti-spam
    } = body;

    // Protection anti-bot honeypot
    if (website_trap) {
      return NextResponse.json({ success: true, leadId: "filtered" }, { status: 200 });
    }

    // Validation des champs obligatoires
    if (!plan || !organization || !contactName || !email) {
      return NextResponse.json(
        { error: "Veuillez renseigner tous les champs obligatoires (modèle, organisation, nom et email)." },
        { status: 400 }
      );
    }

    // Validation du modèle
    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Le modèle sélectionné n'est pas valide." },
        { status: 400 }
      );
    }

    // Validation du format email
    const cleanEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 255) {
      return NextResponse.json(
        { error: "Veuillez renseigner une adresse email professionnelle valide." },
        { status: 400 }
      );
    }

    // Validation des longueurs
    const cleanOrg = String(organization).trim();
    const cleanContact = String(contactName).trim();
    if (cleanOrg.length < 2 || cleanOrg.length > 200 || cleanContact.length < 2 || cleanContact.length > 200) {
      return NextResponse.json(
        { error: "Les informations fournies comportent une taille invalide." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        id: crypto.randomUUID(),
        planType: plan,
        organization: cleanOrg,
        contactName: cleanContact,
        email: cleanEmail,
        phone: phone ? String(phone).trim().slice(0, 50) : null,
        companySize: companySize ? String(companySize).trim().slice(0, 100) : null,
        populationSize: populationSize ? String(populationSize).trim().slice(0, 100) : null,
        beneficiaries: beneficiaries ? String(beneficiaries).trim().slice(0, 100) : null,
      }
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error: any) {
    console.error("Lead Creation Error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi de votre demande." },
      { status: 500 }
    );
  }
}
