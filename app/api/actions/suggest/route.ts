import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Matrice étendue de suggestions d'actions par dimension ou mot-clé de vulnérabilité
const ACTION_SUGGESTIONS = [
  {
    keyword: "stress",
    title: "Atelier de Gestion du Stress",
    description: "Mettre en place un atelier trimestriel animé par un professionnel pour aider les équipes à mieux gérer la charge mentale.",
    dimension: "PROFESSIONAL",
    priority: "HIGH"
  },
  {
    keyword: "communication",
    title: "Formation à la Communication Non Violente (CNV)",
    description: "Proposer une session de formation pour améliorer les échanges interpersonnels et réduire les conflits internes.",
    dimension: "SOCIAL",
    priority: "MEDIUM"
  },
  {
    keyword: "isolement",
    title: "Renforcer les rituels d'équipe",
    description: "Instaurer des points de synchronisation hebdomadaires et des moments de convivialité pour lutter contre l'isolement (notamment en télétravail).",
    dimension: "SOCIAL",
    priority: "HIGH"
  },
  {
    keyword: "équilibre",
    title: "Sensibilisation au droit à la déconnexion",
    description: "Campagne de communication interne sur le respect des horaires de travail et la limitation des emails hors des heures de bureau.",
    dimension: "AFFECTIVE",
    priority: "MEDIUM"
  },
  {
    keyword: "reconnaissance",
    title: "Mise en place d'un système de feedback positif",
    description: "Créer un espace (virtuel ou physique) dédié à la valorisation des succès et de l'entraide au sein des équipes.",
    dimension: "PROFESSIONAL",
    priority: "MEDIUM"
  },
  {
    keyword: "confiance",
    title: "Programme de mentorat interne",
    description: "Associer des collaborateurs expérimentés à des profils juniors pour renforcer la confiance et la transmission des savoir-faire.",
    dimension: "SOCIAL",
    priority: "MEDIUM"
  },
  {
    keyword: "épuisement",
    title: "Audit des charges de travail",
    description: "Analyser la répartition des tâches par équipe pour identifier les surcharges et rééquilibrer les ressources.",
    dimension: "PROFESSIONAL",
    priority: "HIGH"
  },
  {
    keyword: "relation",
    title: "Team building trimestriel",
    description: "Organiser des activités collectives hors cadre professionnel pour consolider les liens interpersonnels.",
    dimension: "SOCIAL",
    priority: "LOW"
  },
  {
    keyword: "motivation",
    title: "Clarification des objectifs individuels",
    description: "Mettre en place des entretiens individuels réguliers pour aligner les objectifs personnels et organisationnels.",
    dimension: "PROFESSIONAL",
    priority: "MEDIUM"
  },
  {
    keyword: "anxiété",
    title: "Accès à un soutien psychologique confidentiel",
    description: "Proposer un accès à des consultations psychologiques via un prestataire externe, en toute confidentialité.",
    dimension: "AFFECTIVE",
    priority: "HIGH"
  }
];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Aucune organisation associée" }, { status: 404 });
    }

    if (user.role !== "ADMIN_B2B" && user.role !== "ADMIN_B2B2C" && user.role !== "ADMIN_B2G" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "campaignId requis" }, { status: 400 });
    }

    // ── Déduplication : ne pas recréer si des actions existent déjà pour cette campagne ──
    const existingActions = await prisma.actionItem.findMany({
      where: { organizationId: user.organizationId, campaignId },
      select: { id: true, title: true, description: true, dimension: true, priority: true },
    });

    if (existingActions.length > 0) {
      return NextResponse.json({
        success: true,
        count: existingActions.length,
        actions: existingActions,
        fromCache: true,
      });
    }

    // Récupérer les résultats de la campagne pour analyser les vulnérabilités
    const assessments = await prisma.assessment.findMany({
      where: { campaignId, status: "SUBMITTED" },
      include: { result: { include: { icr: true } } }
    });

    // Agrégation des vulnérabilités
    const allVulnerabilities = assessments
      .map(a => a.result?.icr?.vulnerabilities || [])
      .flat();

    const vulnerabilitiesText = allVulnerabilities.join(" ").toLowerCase();

    // Matching par mots-clés — prend jusqu'à 5 suggestions uniques
    const matched = ACTION_SUGGESTIONS.filter(s => vulnerabilitiesText.includes(s.keyword));

    // Fallback diversifié (indices 0, 2, 4, 6, 8 pour couvrir différentes dimensions)
    const finalSuggestions = matched.length > 0
      ? matched.slice(0, 5)
      : [ACTION_SUGGESTIONS[0], ACTION_SUGGESTIONS[2], ACTION_SUGGESTIONS[4], ACTION_SUGGESTIONS[6], ACTION_SUGGESTIONS[8]];

    // Création en base (une seule fois grâce à la déduplication ci-dessus)
    const createdActions = [];
    for (const suggestion of finalSuggestions) {
      const newAction = await prisma.actionItem.create({
        data: {
          organizationId: user.organizationId,
          campaignId,
          title: suggestion.title,
          description: suggestion.description,
          dimension: suggestion.dimension as any,
          priority: suggestion.priority,
          status: "PROPOSEE",
          updatedAt: new Date()
        }
      });
      createdActions.push(newAction);
    }

    return NextResponse.json({ success: true, count: createdActions.length, actions: createdActions });

  } catch (error) {
    console.error("[ACTIONS_SUGGEST_ERROR]", error);
    return NextResponse.json({ error: "Erreur lors de la génération des suggestions" }, { status: 500 });
  }
}
