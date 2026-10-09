/**
 * @file prisma/seed-deploy.ts
 * @description Script de déploiement et d'initialisation de la base de production.
 * Exécute de manière idempotente (UPSERT) :
 * 1. Questions IQRH (Reference) & Modules Adaptatifs (AdaptiveQuestion)
 * 2. Bibliothèque de référence Link Office (8 feuilles IRIS)
 * 3. Organisations B2B/B2B2C/Collectivités, Campagnes et Comptes de test/démo
 * 4. Badges relationnels
 * 5. Corpus éditorial et Médiathèque complet (Catégories, Éclaireurs, Articles, Guides, Podcasts)
 */

import { PrismaClient, Dimension, QuestionKind, EclaireurType, MediaType, MediaCategoryType } from "@prisma/client";
import library from "./link-office-library.json";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type LibraryRow = Record<string, string | number | boolean | null>;

const libraryMappings: ReadonlyArray<{ sheet: keyof typeof library; id: string; title: string; category?: string }> = [
  { sheet: "Tags", id: "tag_value", title: "tag_value", category: "tag_type" },
  { sheet: "Besoins", id: "besoin_id", title: "besoin", category: "dimensions_iqrh" },
  { sheet: "Facteurs", id: "factor_id", title: "facteur", category: "type" },
  { sheet: "Recommandations", id: "recommendation_id", title: "titre", category: "categorie" },
  { sheet: "Micro-défis", id: "micro_defi_id", title: "titre", category: "categorie" },
  { sheet: "Partenaires", id: "partenaire_id", title: "nom", category: "categorie" },
  { sheet: "Ressources", id: "ressource_id", title: "titre", category: "categorie" },
  { sheet: "Programmes LO", id: "programme_id", title: "nom_programme", category: "niveau" },
];

async function seedQuestionsAndModules() {
  console.log("📝 1. Initialisation des Questions IQRH & Modules Adaptatifs...");
  const questionsIqrh = library["Questions_IQRH"] as any[];
  const modulesAdaptatifs = library["Modules_Adaptatifs"] as any[];

  for (const q of questionsIqrh) {
    await prisma.question.upsert({
      where: { id: q.id },
      create: {
        id: q.id,
        text: q.text,
        position: q.position,
        kind: QuestionKind.REFERENCE,
        dimension: q.dimension as Dimension,
        version: q.version || 1,
        isActive: true,
      },
      update: {
        text: q.text,
        position: q.position,
        dimension: q.dimension as Dimension,
      },
    });
  }

  for (const mod of modulesAdaptatifs) {
    await prisma.adaptiveModule.upsert({
      where: { id: mod.id },
      create: {
        id: mod.id,
        triggerSituation: mod.triggerSituation,
        title: mod.title,
        objective: mod.objective,
        position: mod.position,
        version: mod.version || 1,
        isActive: true,
      },
      update: {
        title: mod.title,
        triggerSituation: mod.triggerSituation,
        objective: mod.objective,
      },
    });

    if (Array.isArray(mod.questions)) {
      for (const q of mod.questions) {
        await prisma.adaptiveQuestion.upsert({
          where: { id: q.id },
          create: {
            id: q.id,
            moduleId: mod.id,
            position: q.position,
            text: q.text,
            version: q.version || 1,
            isActive: true,
          },
          update: {
            text: q.text,
            position: q.position,
          },
        });
      }
    }
  }
  console.log("   ✓ Questions et modules synchronisés.");
}

async function seedLibrary() {
  console.log("📚 2. Initialisation de la Bibliothèque de référence IRIS...");
  const items = libraryMappings.flatMap(({ sheet, id, title, category }) =>
    (library[sheet] as LibraryRow[]).map((row, index) => ({
      id: sheet === "Tags" || !row[id] ? `${sheet}_${index}` : String(row[id]),
      library: String(sheet),
      title: String(row[title]),
      category: category ? String(row[category] ?? "") : null,
      data: row as any,
    }))
  );

  for (const item of items) {
    await prisma.libraryItem.upsert({
      where: { id: item.id },
      create: item,
      update: { title: item.title, category: item.category, data: item.data },
    });
  }
  console.log(`   ✓ ${items.length} éléments de bibliothèque synchronisés.`);
}

async function seedOrganizationsAndUsers() {
  console.log("🏢 3. Initialisation des Organisations et Comptes Bêta...");

  const acme = await prisma.organization.upsert({
    where: { codeAccess: "ACME-2026-TEST" },
    create: {
      name: "Acme Corp (B2B Test)",
      type: "B2B",
      codeAccess: "ACME-2026-TEST",
      siren: "123456789",
      contactName: "Jean Dupont",
      contactEmail: "jean.dupont@acme.com",
      contactPhone: "0102030405",
      contractType: "SaaS Annuel",
      territory: "France",
      targetPopulation: 100,
      quota: 100,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
    update: {},
  });

  const mutu = await prisma.organization.upsert({
    where: { codeAccess: "MUTU-2026-TEST" },
    create: {
      name: "Mutuelle Solis (B2B2C Test)",
      type: "B2B2C",
      codeAccess: "MUTU-2026-TEST",
      siren: "987654321",
      contactName: "Marie Durant",
      contactEmail: "marie.durant@solis.com",
      contactPhone: "0607080910",
      contractType: "Partenariat Premium",
      territory: "National",
      targetPopulation: 5000,
      quota: 5000,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
    update: {},
  });

  const ville = await prisma.organization.upsert({
    where: { codeAccess: "VILLE-2026-TEST" },
    create: {
      name: "Ville de Testville (Collectivité)",
      type: "B2G",
      codeAccess: "VILLE-2026-TEST",
      contactName: "Marc Maire",
      contactEmail: "contact@testville.fr",
      contactPhone: "0101010101",
      contractType: "Déploiement Territorial",
      territory: "Testville",
      targetPopulation: 50000,
      quota: 10000,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
    update: {},
  });

  const d = new Date();
  const nextMonth = new Date(d);
  nextMonth.setMonth(d.getMonth() + 1);

  const campaignAcme = await prisma.campaign.upsert({
    where: { id: "camp-acme-2026" },
    create: {
      id: "camp-acme-2026",
      organizationId: acme.id,
      title: "Campagne QVT Acme 2026",
      status: "ACTIVE",
      offer: "PREMIUM",
      startDate: d,
      endDate: nextMonth,
      targetPopulation: 100,
    },
    update: {},
  });

  const campaignMutu = await prisma.campaign.upsert({
    where: { id: "camp-mutu-2026" },
    create: {
      id: "camp-mutu-2026",
      organizationId: mutu.id,
      title: "Campagne Nationale Mutuelle Solis 2026",
      status: "ACTIVE",
      offer: "PREMIUM_PLUS",
      startDate: d,
      endDate: nextMonth,
      targetPopulation: 5000,
    },
    update: {},
  });

  const campaignVille = await prisma.campaign.upsert({
    where: { id: "camp-ville-2026" },
    create: {
      id: "camp-ville-2026",
      organizationId: ville.id,
      title: "Baromètre Territorial Testville 2026",
      status: "ACTIVE",
      offer: "PREMIUM_PLUS",
      startDate: d,
      endDate: nextMonth,
      targetPopulation: 10000,
    },
    update: {},
  });

  const passwordHash = bcrypt.hashSync("Admin1234!", 10);

  const usersToSeed = [
    {
      email: "superadmin@linkoffice.fr",
      firstName: "Super",
      lastName: "Admin",
      role: "SUPERADMIN" as const,
      subscription: "PREMIUM_PLUS" as const,
    },
    {
      email: "demo@linkoffice.fr",
      firstName: "Démo",
      lastName: "User",
      role: "EMPLOYEE" as const,
      subscription: "PREMIUM_PLUS" as const,
    },
    {
      email: "claire.bernard.52@yahoo.fr",
      firstName: "Claire",
      lastName: "Bernard",
      role: "EMPLOYEE" as const,
      subscription: "FREEMIUM" as const,
      organizationId: acme.id,
      campaignId: campaignAcme.id,
    },
    {
      email: "bruno.leroy@metropole-grandparis.fr",
      firstName: "Bruno",
      lastName: "Leroy",
      role: "EMPLOYEE" as const,
      subscription: "PREMIUM" as const,
      organizationId: acme.id,
      campaignId: campaignAcme.id,
    },
    {
      email: "jean.dupont@acme.com",
      firstName: "Jean",
      lastName: "Dupont",
      role: "HR_ADMIN" as const,
      subscription: "PREMIUM" as const,
      organizationId: acme.id,
      campaignId: campaignAcme.id,
    },
    {
      email: "marie.durant@solis.com",
      firstName: "Marie",
      lastName: "Durant",
      role: "HR_ADMIN" as const,
      subscription: "PREMIUM_PLUS" as const,
      organizationId: mutu.id,
      campaignId: campaignMutu.id,
    },
    {
      email: "marc.maire@testville.fr",
      firstName: "Marc",
      lastName: "Maire",
      role: "HR_ADMIN" as const,
      subscription: "PREMIUM_PLUS" as const,
      organizationId: ville.id,
      campaignId: campaignVille.id,
    },
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        subscription: u.subscription,
        password: passwordHash,
        points: 450,
        organizationId: u.organizationId || null,
        campaignId: u.campaignId || null,
      },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        subscription: u.subscription,
        password: passwordHash,
      },
    });
  }

  console.log(`   ✓ ${usersToSeed.length} comptes de test & démo synchronisés.`);
}

async function seedBadges() {
  console.log("🏅 4. Initialisation des Badges relationnels...");
  const badges = [
    {
      name: "Pionnier",
      description: "Premier pas vers l'épanouissement relationnel.",
      icon: "🌱",
      pointsRequired: 100,
    },
    {
      name: "Explorateur",
      description: "L'engagement commence à porter ses fruits.",
      icon: "🧭",
      pointsRequired: 300,
    },
    {
      name: "Acteur du Changement",
      description: "Vous prenez le contrôle de votre équilibre.",
      icon: "🔥",
      pointsRequired: 600,
    },
    {
      name: "Pilier Relationnel",
      description: "Une régularité et un investissement remarquables.",
      icon: "🏛️",
      pointsRequired: 1000,
    },
    {
      name: "Maître de l'Équilibre",
      description: "L'excellence dans la gestion de votre qualité de vie.",
      icon: "👑",
      pointsRequired: 2000,
    },
  ];

  for (const b of badges) {
    const existing = await prisma.badge.findUnique({ where: { name: b.name } });
    if (!existing) {
      await prisma.badge.create({ data: b });
    }
  }
  console.log("   ✓ Badges synchronisés.");
}

async function seedMedia() {
  console.log("📂 5. Initialisation du Corpus Média, Éclaireurs & Guides...");

  // 1. Catégories Média
  const categoriesData: Array<{ name: string; slug: string; type: MediaCategoryType }> = [
    { name: "Travail & Coopération", slug: "travail-cooperation", type: "SUJET" },
    { name: "Famille & Proches", slug: "famille-proches", type: "SUJET" },
    { name: "Vie de Couple & Intimité", slug: "couple-intimite", type: "SUJET" },
    { name: "Lien Social & Citoyenneté", slug: "lien-social-citoyennete", type: "SUJET" },
    { name: "Estime de Soi & Limites", slug: "estime-soi-limites", type: "SUJET" },
    { name: "Santé Mentale & Prévention", slug: "sante-mentale-prevention", type: "SUJET" },
    { name: "Vie Professionnelle (IQRH D4)", slug: "iqrh-professionnel", type: "DIMENSION_IQRH" },
    { name: "Relations Affectives (IQRH D2)", slug: "iqrh-affectif", type: "DIMENSION_IQRH" },
    { name: "Relations Sociales (IQRH D1)", slug: "iqrh-social", type: "DIMENSION_IQRH" },
    { name: "Relation à Soi (IQRH D5)", slug: "iqrh-soi", type: "DIMENSION_IQRH" },
    { name: "Vie Sentimentale (IQRH D3)", slug: "iqrh-sentimental", type: "DIMENSION_IQRH" },
    { name: "Transitions Professionnelles", slug: "transitions-pro", type: "MOMENT_DE_VIE" },
    { name: "Gestion des Tensions", slug: "gestion-tensions", type: "MOMENT_DE_VIE" },
    { name: "Charge Mentale & Surcharge", slug: "charge-mentale-surcharge", type: "MOMENT_DE_VIE" },
    { name: "Guides Pratiques", slug: "guides-pratiques", type: "TYPE_CONTENU" },
    { name: "Analyses de Chercheurs", slug: "analyses-chercheurs", type: "TYPE_CONTENU" },
    { name: "Podcasts & Écoute", slug: "podcasts-ecoute", type: "TYPE_CONTENU" },
  ];

  const categoryMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const rec = await prisma.mediaCategory.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: cat,
    });
    categoryMap[cat.slug] = rec;
  }

  // 2. Éclaireurs
  const eclaireursData: Array<{ name: string; type: EclaireurType; profession: string; bio: string; photoUrl: string }> = [
    {
      name: "Dr. Marc Vasseur",
      type: "PROFESSIONNEL",
      profession: "Psychologue du Travail & Chercheur en Dynamiques d'Équipe",
      bio: "Docteur en psychologie sociale et du travail, Marc Vasseur accompagne depuis quinze ans les organisations privées et publiques dans l'implantation de la sécurité psychologique.",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Hélène de Saint-Germain",
      type: "PROFESSIONNEL",
      profession: "Médiatrice Familiale Certifiée & Praticienne CNV",
      bio: "Spécialiste de la régulation des conflits intrafamiliaux et de l'écoute bienveillante, Hélène forme soignants et éducateurs à la désescalade verbale.",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Julien Rochefort",
      type: "PROFESSIONNEL",
      profession: "Sociologue des Réseaux & Auteur",
      bio: "Auteur de plusieurs essais sur la morphologie des liens sociaux en milieu urbain, Julien étudie l'impact des micro-interactions quotidiennes.",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Claire Benhamou",
      type: "PROFESSIONNEL",
      profession: "Master Coach ICF & Superviseure",
      bio: "Pionnière dans l'accompagnement des profils en sur-adaptation relationnelle, Claire enseigne l'art de l'affirmation de soi sereine.",
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Dr. Antoine Mercier",
      type: "PROFESSIONNEL",
      profession: "Thérapeute Systémicien de Couple & Sexologue",
      bio: "Praticien hospitalier et consultant, Antoine travaille sur la dialectique entre attachement sécurisant et autonomie au sein des couples contemporains.",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Sarah Danvers",
      type: "TEMOIN",
      profession: "Directrice de Transition & Ancienne Patiente Partenaire",
      bio: "Après avoir traversé un épuisement professionnel doublé d'un effondrement relationnel, Sarah partage son parcours de reconstruction méthodique.",
      photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const eclaireurMap: Record<string, any> = {};
  for (const ecl of eclaireursData) {
    const existing = await prisma.mediaEclaireur.findFirst({ where: { name: ecl.name } });
    if (existing) {
      eclaireurMap[ecl.name] = await prisma.mediaEclaireur.update({
        where: { id: existing.id },
        data: ecl,
      });
    } else {
      eclaireurMap[ecl.name] = await prisma.mediaEclaireur.create({ data: ecl });
    }
  }

  // 3. Articles & Médias
  const mediaItems: Array<{
    slug: string;
    title: string;
    summary: string;
    mediaType: MediaType;
    coverImage: string;
    duration: number;
    published: boolean;
    publishedAt: Date;
    dimensionIqrh: Dimension;
    content: string;
    categories: string[];
    eclaireurs: string[];
  }> = [
    {
      slug: "securite-psychologique-equipe-pilier-performance",
      title: "La Sécurité Psychologique : Pilier Oublié de la Performance et du Climat d'Équipe",
      summary: "Pourquoi la peur de paraître incompétent détruit le capital relationnel en entreprise, et comment instaurer un climat où la vulnérabilité devient un levier d'apprentissage collectif.",
      mediaType: "GUIDE",
      coverImage: "/images/media/securite-psychologique-equipe.jpg",
      duration: 11,
      published: true,
      publishedAt: new Date("2026-10-02T09:00:00Z"),
      dimensionIqrh: "PROFESSIONAL",
      content: `## Introduction : Le coût invisible de la retenue\n\nDans la plupart des organisations contemporaines, le plus grand frein à l'innovation et au bien-être au travail n'est ni le manque de compétences techniques, ni la charge de travail brute, mais un phénomène silencieux : l'autocensure relationnelle.\n\nCombien de réunions se terminent par un silence approbateur alors que la moitié des participants entrevoient une faille majeure dans le projet présenté ?\n\n### Ce que dit la recherche : De Harvard au Projet Aristote\n\nLe concept a été formalisé dès 1999 par la professeure Amy Edmondson à la Harvard Business School. Le Projet Aristote mené par Google a confirmé que le facteur numéro un prédisant la réussite des équipes d'élite était, de loin, la sécurité psychologique.\n\n### Protocole d'action Link Office\n\n1. Formaliser le droit à la question blanche.\n2. Le débriefing d'apprentissage plutôt que l'autopsie punitive.\n3. La binômisation des prises de risque.`,
      categories: ["travail-cooperation", "iqrh-professionnel", "guides-pratiques", "transitions-pro"],
      eclaireurs: ["Dr. Marc Vasseur"],
    },
    {
      slug: "art-ecoute-active-desamorcer-conflits-cercle-proche",
      title: "L'Art de l'Écoute Active : Désamorcer les Conflits Invisibles dans le Cercle Proche",
      summary: "Écouter pour comprendre plutôt que pour répondre : transformer vos échanges grâce à la présence attentive et à la communication non-violente.",
      mediaType: "ARTICLE",
      coverImage: "/images/media/art-ecoute-active-proches.jpg",
      duration: 9,
      published: true,
      publishedAt: new Date("2026-10-03T11:00:00Z"),
      dimensionIqrh: "AFFECTIVE",
      content: `## Pourquoi nous n'écoutons presque jamais vraiment\n\nDans la vie quotidienne, la plupart de nos conversations ne sont pas de véritables dialogues, mais deux monologues alternés entrecoupés de pauses polies.\n\n### Les 3 pièges majeurs de l'écoute réflexe\n\n1. Le réflexe du sauveteur (vouloir solutionner au lieu d'accueillir).\n2. Le réflexe de minoration (« Ce n'est rien, ça va passer »).\n3. Le rapt conversationnel (ramener la conversation sur sa propre expérience).\n\n### Le modèle Carl Rogers : Présence & Reformulation\n\nL'écoute authentique repose sur l'inconditionnalité, la congruence et l'empathie réflective.`,
      categories: ["famille-proches", "iqrh-affectif", "gestion-tensions", "analyses-chercheurs"],
      eclaireurs: ["Hélène de Saint-Germain"],
    },
    {
      slug: "force-liens-faibles-tissu-social-resilience",
      title: "La Force des Liens Faibles : Pourquoi vos Connaissances Valent de l'Or pour votre Santé",
      summary: "La sociologie montre que nos interactions occasionnelles (voisins, commerçants, anciens collègues) forment le socle le plus puissant de notre sentiment d'appartenance.",
      mediaType: "ANALYSE",
      coverImage: "/images/media/force-liens-faibles-sociologie.jpg",
      duration: 8,
      published: true,
      publishedAt: new Date("2026-10-04T14:30:00Z"),
      dimensionIqrh: "SOCIAL",
      content: `## La découverte contre-intuitive de Mark Granovetter\n\nEn 1973, le sociologue Mark Granovetter publie une étude révolutionnaire : The Strength of Weak Ties. Il prouve que la majorité des opportunités déterminantes proviennent de liens faibles.\n\n### Micro-interactions : Les vitamines du quotidien\n\nSaluer un commerçant, échanger deux mots avec un voisin : ces micro-contacts activent le système neurochimique de l'apaisement (ocytocine) et protègent contre l'isolement moderne.`,
      categories: ["lien-social-citoyennete", "iqrh-social", "analyses-chercheurs"],
      eclaireurs: ["Julien Rochefort"],
    },
    {
      slug: "savoir-dire-non-sans-culpabilite-poser-limites",
      title: "Savoir Dire Non sans Culpabilité : Poser des Limites Saines pour Protéger le Lien",
      summary: "Dire oui par peur de déplaire détruit le lien à long terme en nourrissant le ressentiment. Apprenez la grammaire du refus constructif.",
      mediaType: "GUIDE",
      coverImage: "/images/media/savoir-dire-non-limites.jpg",
      duration: 12,
      published: true,
      publishedAt: new Date("2026-10-05T08:15:00Z"),
      dimensionIqrh: "SELF",
      content: `## Le piège mortel de la sur-adaptation\n\nDire oui par politesse ou culpabilité est la cause numéro 1 d'épuisement relationnel. À chaque fois que vous dites un oui forcé à l'autre, vous vous dites un non violent à vous-même.\n\n### Protocole en 3 temps du refus bienveillant\n\n1. Reconnaître la demande (« Je comprends tout à fait ton besoin »).\n2. Poser la limite sans justification excessive (« Mais je ne suis pas en mesure d'assurer cela cette semaine »).\n3. Proposer une alternative réaliste.`,
      categories: ["estime-soi-limites", "iqrh-soi", "charge-mentale-surcharge", "guides-pratiques"],
      eclaireurs: ["Claire Benhamou"],
    },
    {
      slug: "desamorcer-routine-couple-raviver-intimite",
      title: "Désamorcer la Routine en Couple : Comment Passer de la Colocation Logistique à la Complicité",
      summary: "Quand le quotidien réduit le couple à une PME domestique, comment recréer des îlots d'émerveillement et réinvestir l'intimité relationnelle ?",
      mediaType: "ARTICLE",
      coverImage: "/images/media/desamorcer-routine-couple.jpg",
      duration: 10,
      published: true,
      publishedAt: new Date("2026-10-06T18:00:00Z"),
      dimensionIqrh: "SENTIMENTAL",
      content: `## Du couple amoureux au couple logistique\n\nAvec les années et les contraintes, les conjoints tombent souvent dans le piège de la logistique partagée au détriment de l'émerveillement mutuel.\n\n### Les 3 rituels de protection du lien intime\n\n1. Le couvre-feu logistique après 21h.\n2. La curiosité renouvelée : poser une question sur le monde intérieur de l'autre plutôt que sur son agenda.\n3. Le micro-voyage sensoriel partagé.`,
      categories: ["couple-intimite", "iqrh-sentimental", "analyses-chercheurs"],
      eclaireurs: ["Dr. Antoine Mercier"],
    },
    {
      slug: "podcast-ep1-sortir-burnout-relationnel",
      title: "Podcast Épisode 1 — Sortir du Burnout Relationnel : Quand Donner Trop Finit par Épuiser",
      summary: "Grand entretien avec Sarah Danvers sur la mécanique de l'effondrement relationnel et les étapes concrètes pour réapprendre à recevoir.",
      mediaType: "PODCAST",
      coverImage: "/images/media/podcast-burnout-relationnel.jpg",
      duration: 24,
      published: true,
      publishedAt: new Date("2026-10-07T07:30:00Z"),
      dimensionIqrh: "PROFESSIONAL",
      content: `## Épisode 1 : L'épuisement de la sollicitude\n\nDans cet épisode fondateur, Sarah Danvers témoigne de la rupture d'équilibre qui l'a menée au surmenage relationnel.\n\n### Thématiques abordées\n\n- Le profil du facilitateur invétéré.\n- Les signaux d'alerte somatiques.\n- Réapprendre à recevoir sans se justifier.`,
      categories: ["sante-mentale-prevention", "charge-mentale-surcharge", "podcasts-ecoute", "iqrh-professionnel"],
      eclaireurs: ["Sarah Danvers"],
    },
  ];

  for (const item of mediaItems) {
    const catConnections = item.categories
      .map((slug) => categoryMap[slug]?.id)
      .filter(Boolean)
      .map((id) => ({ id }));

    const eclConnections = item.eclaireurs
      .map((name) => eclaireurMap[name]?.id)
      .filter(Boolean)
      .map((id) => ({ id }));

    await prisma.mediaContent.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        mediaType: item.mediaType,
        coverImage: item.coverImage,
        duration: item.duration,
        published: item.published,
        publishedAt: item.publishedAt,
        dimensionIqrh: item.dimensionIqrh,
        content: item.content,
        categories: { connect: catConnections },
        eclaireurs: { connect: eclConnections },
      },
      update: {
        title: item.title,
        summary: item.summary,
        mediaType: item.mediaType,
        coverImage: item.coverImage,
        duration: item.duration,
        published: item.published,
        dimensionIqrh: item.dimensionIqrh,
        content: item.content,
        categories: { set: catConnections },
        eclaireurs: { set: eclConnections },
      },
    });
  }

  // Maillage d'articles reliés
  const allMedia = await prisma.mediaContent.findMany({ select: { id: true } });
  if (allMedia.length >= 2) {
    for (const art of allMedia) {
      const others = allMedia.filter((o) => o.id !== art.id).slice(0, 2);
      await prisma.mediaContent.update({
        where: { id: art.id },
        data: {
          linkedArticles: {
            set: others.map((o) => ({ id: o.id })),
          },
        },
      });
    }
  }

  console.log(`   ✓ ${mediaItems.length} contenus média majeurs et maillages croisés synchronisés.`);
}

async function main() {
  console.log("════════════════════════════════════════════════════════════════");
  console.log("   DÉPLOIEMENT & INITIALISATION DE LA BASE LINK OFFICE         ");
  console.log("════════════════════════════════════════════════════════════════\n");

  await seedQuestionsAndModules();
  await seedLibrary();
  await seedOrganizationsAndUsers();
  await seedBadges();
  await seedMedia();

  console.log("\n🚀 Initialisation de la base terminée avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du déploiement :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
