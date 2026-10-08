/**
 * @file seed-media-content.ts
 * @description Script d'insertion des contenus éditoriaux, catégories et éclaireurs pour le CMS Média de Link Office.
 * 
 * Contenus d'expertise en santé relationnelle :
 * 1. La Sécurité Psychologique en Équipe (Dimension: PROFESSIONAL | Format: GUIDE)
 * 2. L'Art de l'Écoute Active dans le Cercle Proche (Dimension: AFFECTIVE | Format: ARTICLE)
 * 3. La Force des Liens Faibles & Tissu Social (Dimension: SOCIAL | Format: ANALYSE)
 * 4. Savoir Dire Non sans Rompre le Lien (Dimension: SELF | Format: GUIDE)
 * 5. Désamorcer la Routine Affective en Couple (Dimension: SENTIMENTAL | Format: ARTICLE)
 * 6. Podcast Épisode 1 — Sortir du Burnout Relationnel (Dimension: PROFESSIONAL | Format: PODCAST)
 */

import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("════════════════════════════════════════════════════════════════");
  console.log("   INSERTION DU CORPUS ÉDITORIAL & MÉDIA LINK OFFICE            ");
  console.log("   (SANTÉ RELATIONNELLE, ÉCLAIREURS & RESSOURCES EXPERTES)      ");
  console.log("════════════════════════════════════════════════════════════════\n");

  // 1. Création des Catégories Média
  console.log("📂 1. Création des Catégories Média...");

  const categoriesData = [
    // SUJET
    { name: "Travail & Coopération", slug: "travail-cooperation", type: "SUJET" as const },
    { name: "Famille & Proches", slug: "famille-proches", type: "SUJET" as const },
    { name: "Vie de Couple & Intimité", slug: "couple-intimite", type: "SUJET" as const },
    { name: "Lien Social & Citoyenneté", slug: "lien-social-citoyennete", type: "SUJET" as const },
    { name: "Estime de Soi & Limites", slug: "estime-soi-limites", type: "SUJET" as const },
    { name: "Santé Mentale & Prévention", slug: "sante-mentale-prevention", type: "SUJET" as const },
    // DIMENSION_IQRH
    { name: "Vie Professionnelle (IQRH D4)", slug: "iqrh-professionnel", type: "DIMENSION_IQRH" as const },
    { name: "Relations Affectives (IQRH D2)", slug: "iqrh-affectif", type: "DIMENSION_IQRH" as const },
    { name: "Relations Sociales (IQRH D1)", slug: "iqrh-social", type: "DIMENSION_IQRH" as const },
    { name: "Relation à Soi (IQRH D5)", slug: "iqrh-soi", type: "DIMENSION_IQRH" as const },
    { name: "Vie Sentimentale (IQRH D3)", slug: "iqrh-sentimental", type: "DIMENSION_IQRH" as const },
    // MOMENT_DE_VIE
    { name: "Transitions Professionnelles", slug: "transitions-pro", type: "MOMENT_DE_VIE" as const },
    { name: "Gestion des Tensions", slug: "gestion-tensions", type: "MOMENT_DE_VIE" as const },
    { name: "Charge Mentale & Surcharge", slug: "charge-mentale-surcharge", type: "MOMENT_DE_VIE" as const },
    // TYPE_CONTENU
    { name: "Guides Pratiques", slug: "guides-pratiques", type: "TYPE_CONTENU" as const },
    { name: "Analyses de Chercheurs", slug: "analyses-chercheurs", type: "TYPE_CONTENU" as const },
    { name: "Podcasts & Écoute", slug: "podcasts-ecoute", type: "TYPE_CONTENU" as const },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const record = await prisma.mediaCategory.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: cat,
    });
    createdCategories[cat.slug] = record;
  }
  console.log(`   ✓ ${Object.keys(createdCategories).length} catégories créées / synchronisées.`);

  // 2. Création des Éclaireurs (Professionnels et Témoins)
  console.log("\n👥 2. Création des Profils Éclaireurs...");

  const eclaireursData = [
    {
      name: "Dr. Marc Vasseur",
      type: "PROFESSIONNEL" as const,
      profession: "Psychologue du Travail & Chercheur en Dynamiques d'Équipe",
      bio: "Docteur en psychologie sociale et du travail, Marc Vasseur accompagne depuis quinze ans les organisations privées et publiques dans l'implantation de la sécurité psychologique et la prévention de l'usure relationnelle managériale.",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Hélène de Saint-Germain",
      type: "PROFESSIONNEL" as const,
      profession: "Médiatrice Familiale Certifiée & Praticienne CNV",
      bio: "Spécialiste de la régulation des conflits intrafamiliaux et de l'écoute bienveillante, Hélène forme soignants, éducateurs et particuliers aux leviers de la désescalade verbale et du désamorçage des nœuds relationnels.",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Julien Rochefort",
      type: "PROFESSIONNEL" as const,
      profession: "Sociologue des Réseaux & Auteur",
      bio: "Auteur de plusieurs essais sur la morphologie des liens sociaux en milieu urbain, Julien étudie l'impact des micro-interactions quotidiennes sur l'espérance de vie relationnelle et la résilience collective.",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Claire Benhamou",
      type: "PROFESSIONNEL" as const,
      profession: "Master Coach ICF & Superviseure",
      bio: "Pionnière dans l'accompagnement des profils en sur-adaptation relationnelle ('people-pleasing'), Claire enseigne l'art de l'affirmation de soi sereine sans rupture du lien d'attachement.",
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Dr. Antoine Mercier",
      type: "PROFESSIONNEL" as const,
      profession: "Thérapeute Systémicien de Couple & Sexologue",
      bio: "Praticien hospitalier et consultant, Antoine travaille sur la dialectique entre désir, attachement sécurisant et autonomie au sein des couples contemporains face à l'usure du temps.",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Sarah Danvers",
      type: "TEMOIN" as const,
      profession: "Directrice de Transition & Ancienne Patiente Partenaire",
      bio: "Après avoir traversé un épuisement professionnel doublé d'un effondrement de son écosystème relationnel à 42 ans, Sarah partage son parcours de reconstruction méthodique et l'importance des binômes d'entraide.",
      photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const createdEclaireurs: Record<string, any> = {};
  for (const ecl of eclaireursData) {
    // Upsert basé sur le nom
    const existing = await prisma.mediaEclaireur.findFirst({ where: { name: ecl.name } });
    if (existing) {
      createdEclaireurs[ecl.name] = await prisma.mediaEclaireur.update({
        where: { id: existing.id },
        data: ecl,
      });
    } else {
      createdEclaireurs[ecl.name] = await prisma.mediaEclaireur.create({ data: ecl });
    }
  }
  console.log(`   ✓ ${Object.keys(createdEclaireurs).length} profils éclaireurs enregistrés.`);

  // 3. Insertion des Contenus Média Majeurs
  console.log("\n📚 3. Création des Contenus Média détaillés (Articles, Guides, Podcasts)...");

  // CONTENU 1 : SÉCURITÉ PSYCHOLOGIQUE EN ÉQUIPE
  const media1 = {
    slug: "securite-psychologique-equipe-pilier-performance",
    title: "La Sécurité Psychologique : Pilier Oublié de la Performance et du Climat d'Équipe",
    summary: "Pourquoi la peur de paraître incompétent détruit le capital relationnel en entreprise, et comment instaurer un climat où la vulnérabilité devient un levier d'apprentissage collectif.",
    mediaType: "GUIDE" as const,
    coverImage: "/images/media/securite-psychologique-equipe.jpg",
    duration: 11,
    published: true,
    publishedAt: new Date("2026-10-02T09:00:00Z"),
    dimensionIqrh: "PROFESSIONAL" as const,
    content: `## Introduction : Le coût invisible de la retenue

Dans la plupart des organisations contemporaines, le plus grand frein à l'innovation et au bien-être au travail n'est ni le manque de compétences techniques, ni la charge de travail brute, mais un phénomène silencieux : **l'autocensure relationnelle**.

Combien de réunions se terminent par un silence approbateur alors que la moitié des participants entrevoient une faille majeure dans le projet présenté ? Combien de collaborateurs préfèrent passer des heures à masquer une erreur de débutant plutôt que de solliciter un collègue expérimenté, par crainte d'être étiquetés comme incompétents ?

Ce silence relationnel a un nom scientifique : l'absence de **sécurité psychologique**.

---

## 1. Ce que dit la recherche : De Harvard au Projet Aristote

Le concept a été formalisé dès 1999 par la professeure **Amy Edmondson** à la Harvard Business School. Elle le définit comme :

> *« La croyance partagée par les membres d'une équipe qu'il est sans danger de prendre des risques interpersonnels — que personne ne sera humilié, rejeté ou puni pour avoir posé une question, exprimé un doute ou admis une erreur. »*

Cette intuition a trouvé sa confirmation empirique la plus éclatante lors du célèbre **Projet Aristote** mené par Google sur plus de 180 équipes réelles. Pendant trois ans, les statisticiens ont cherché ce qui distinguait les équipes d'élite des équipes moyennes. Était-ce la somme des QI individuels ? La mixité des compétences ? L'ancienneté ? La réponse fut sans appel : aucune de ces variables ne prédisait la réussite. 

**Le facteur numéro un était, de loin, la sécurité psychologique.**

\`\`\`
Indicateurs d'un environnement relationnel sain :
┌─────────────────────────────────┬─────────────────────────────────┐
│ Climat de Peur / Défensif        │ Climat de Sécurité Psychologique │
├─────────────────────────────────┼─────────────────────────────────┤
│ • On cache ses erreurs           │ • On analyse l'erreur collective │
│ • Les désaccords sont punis     │ • La contradiction est valorisée │
│ • Silences polis en réunion      │ • Questions authentiques         │
│ • Surcharge relationnelle isolée │ • Entraide & Binôme spontanés    │
└─────────────────────────────────┴─────────────────────────────────┘
\`\`\`

---

## 2. Les 4 stades de la maturité relationnelle en équipe

Selon les travaux du Dr. Timothy Clark, une équipe chemine à travers quatre seuils successifs :

1. **La sécurité d'inclusion :** Le sentiment fondamental d'être accepté pour qui l'on est, sans condition de performance immédiate.
2. **La sécurité d'apprentissage :** La liberté de poser des questions « naïves », d'expérimenter et de demander du feedback sans rougir.
3. **La sécurité de contribution :** L'assurance que ses idées et son énergie sont accueillies avec curiosité et respect.
4. **La sécurité de contestation (Challenger safety) :** Le stade ultime où un collaborateur peut remettre en question le statu quo ou l'avis de son responsable sans craindre de représailles.

---

## 3. Protocole d'action LinkOffice : 4 rituels concrets

Pour ancrer durablement la sécurité psychologique dans votre équipe, adoptez ces micro-habitudes :

### A. Formaliser le « Droit à la question blanche »
En début de sprint ou de réunion stratégique, le leader pose lui-même une question montrant ses propres limites : *« Sur ce point précis, je n'ai pas la certitude absolue ; comment voyez-vous les angles morts ? »*. La vulnérabilité du leader est le premier déclencheur de confiance.

### B. Le débriefing d'apprentissage (vs autopsie punitive)
Face à un incident, bannissez la question *« Qui a fait ça ? »* pour la remplacer systématiquement par : *« Quel maillon de notre processus relationnel a manqué de clarté pour qu'une telle situation survienne ? »*.

### C. La binômisation des prises de risque
Ne laissez jamais un collaborateur porter seul une proposition disruptive. Associez-lui un **binôme relationnel** miroir qui l'aide à affiner son argumentaire et partage la charge émotionnelle de la présentation.

---

## Micro-défi de la semaine pour votre bilan IQRH

> **Action concrète (+20 pts XP) :** Lors de votre prochaine réunion d'équipe, formulez explicitement un doute ou remerciez chaleureusement un collègue qui a osé exprimer une objection constructive. Notez l'impact immédiat sur l'énergie collective dans votre journal relationnel.`,
  };

  // CONTENU 2 : ÉCOUTE ACTIVE DANS LE CERCLE PROCHE
  const media2 = {
    slug: "art-ecoute-active-desamorcer-conflits-cercle-proche",
    title: "L'Art de l'Écoute Active : Désamorcer les Conflits Invisibles dans le Cercle Proche",
    summary: "Écouter pour comprendre plutôt que pour répondre : comment transformer vos échanges avec vos proches grâce à la présence attentive et à la communication non-violente.",
    mediaType: "ARTICLE" as const,
    coverImage: "/images/media/art-ecoute-active-proches.jpg",
    duration: 9,
    published: true,
    publishedAt: new Date("2026-10-03T11:00:00Z"),
    dimensionIqrh: "AFFECTIVE" as const,
    content: `## Pourquoi nous n'écoutons presque jamais vraiment

Dans la vie quotidienne, la plupart de nos conversations ne sont pas de véritables dialogues, mais deux monologues alternés entrecoupés de pauses polies. 

Lorsqu'un proche vous confie une détresse ou une contrariété, quelle est votre première impulsion ?
- Lui apporter immédiatement une solution pratique (*« Tu n'as qu'à lui dire que... »*)
- Relativiser son ressenti (*« Ce n'est pas si grave, regarde le bon côté des choses »*)
- Raconter votre propre expérience (*« C'est exactement ce qui m'est arrivé l'année dernière ! »*)

Bien que motivées par une intention bienveillante, ces trois réactions produisent paradoxalement le même effet : **elles isolent l'autre** et rompent le sentiment de sécurité émotionnelle.

---

## 1. Les 3 pièges majeurs de l'écoute réflexe

1. **Le réflexe du sauveteur :** Vouloir résoudre le problème technique au lieu d'accueillir la charge émotionnelle. Dans 80% des cas, l'autre n'attend pas une ordonnance d'actions, mais la certitude que son émotion a été entendue.
2. **Le réflexe de minoration :** Tenter de consoler en minimisant (*« Tu verras, demain ça ira mieux »*). L'interlocuteur entend : *« Tu exagères, ton émotion n'est pas légitime »*.
3. **Le rapt conversationnel :** Ramener la lumière sur soi. Vous croyez créer du lien par mimétisme, vous confisquez en réalité l'espace d'écoute.

---

## 2. Le modèle Carl Rogers : Présence & Reformulation

Le psychologue américain Carl Rogers a démontré que l'écoute thérapeutique la plus puissante repose sur trois piliers indissociables :
- **L'inconditionnalité :** Suspendre tout jugement de valeur pendant le temps de la parole.
- **La congruence :** Être présent dans son corps, sans double langage ni distraction par les écrans.
- **L'empathie réflective :** Renvoyer à l'autre le reflet exact de ce qu'il traverse.

\`\`\`
La formule de reformulation empathique :
« Si je comprends bien, ce qui t'a le plus blessé(e) dans cette situation, 
c'est le sentiment que tes efforts n'ont pas été reconnus... C'est bien ça ? »
\`\`\`

---

## 3. Exercice pratique : Les 5 minutes de silence généreux

Testez ce soir cet exercice issu des protocoles de médiation :

1. **Proposez un temps dédié :** *« J'ai envie de savoir comment s'est passée ta journée. Prends 5 minutes, je t'écoute sans t'interrompre et sans donner de conseil. »*
2. **Posez votre téléphone dans une autre pièce.**
3. **Écoutez avec les yeux et le silence.** Hochez la tête, validez les silences.
4. **Ne concluez pas par une solution**, mais par une question d'approfondissement : *« Qu'est-ce que tu ressens maintenant que tu l'as formulé ? »*.

Vous constaterez que la qualité du lien affectif ne dépend pas du nombre d'heures passées ensemble, mais de la **densité de présence** partagée.`,
  };

  // CONTENU 3 : LA FORCE DES LIENS FAIBLES
  const media3 = {
    slug: "force-des-liens-faibles-capital-sante-relations",
    title: "La Force des Liens Faibles : Pourquoi vos Micro-Interactions Quotidiennes Protègent votre Santé",
    summary: "Mark Granovetter et les neurosciences révèlent pourquoi échanger trois mots avec son commerçant ou son voisin stimule le bien-être autant que nos relations intimes les plus profondes.",
    mediaType: "ANALYSE" as const,
    coverImage: "/images/media/force-des-liens-faibles.jpg",
    duration: 10,
    published: true,
    publishedAt: new Date("2026-10-04T14:30:00Z"),
    dimensionIqrh: "SOCIAL" as const,
    content: `## Au-delà du premier cercle : L'anatomie méconnue de notre écosystème

Lorsque nous pensons à notre santé relationnelle, notre esprit se tourne spontanément vers nos liens les plus denses : notre conjoint, nos enfants, nos amis d'enfance. Nous tenons pour acquis que notre équilibre psychologique dépend exclusivement de ce noyau dur.

Pourtant, un demi-siècle de sociologie urbaine et d'épidémiologie sociale prouve exactement l'inverse : **l'épanouissement humain exige une biodiversité relationnelle**.

En 1973, le sociologue Mark Granovetter publiait une étude fondatrice intitulée *« The Strength of Weak Ties »*. Sa découverte clé : nos opportunités professionnelles, notre ouverture intellectuelle et notre sentiment d'appartenance à la communauté ne proviennent pas de nos amis intimes, mais de nos connaissances périphériques — nos **liens faibles**.

---

## 1. Qu'est-ce qu'un lien faible au quotidien ?

Les liens faibles sont les personnes que vous croisez régulièrement sans partager avec elles une intimité émotionnelle profonde :
- Le collègue d'un autre département avec qui vous prenez un café le mardi.
- Le gardien d'immeuble, le libraire ou le commerçant du quartier.
- Le partenaire de running que vous saluez au parc.
- Le membre d'un groupe associatif avec lequel vous échangez sur un projet commun.

\`\`\`
L'écosystème relationnel complet selon LinkOffice :
       ┌─────────────────────────────────────┐
       │     LIENS AMBIANTS (Quartier, Ville) │
       │   ┌─────────────────────────────┐   │
       │   │    LIENS FAIBLES (Réseau)   │   │
       │   │   ┌─────────────────────┐   │   │
       │   │   │   LIENS FORTS       │   │   │
       │   │   │ (Famille, Intimes)  │   │   │
       │   │   │      [ VOUS ]       │   │   │
       │   │   └─────────────────────┘   │   │
       │   └─────────────────────────────┘   │
       └─────────────────────────────────────┘
\`\`\`

---

## 2. L'impact biologique mesuré des micro-connexions

Les travaux récents en neurobiologie comportementale démontrent que chaque micro-interaction bienveillante déclenche un cocktail neurochimique protecteur :
- **Sécrétion d'ocytocine :** Même un échange de sourires de 10 secondes active les récepteurs de l'attachement sécurisant et diminue la tension artérielle.
- **Réduction du cortisol :** Le sentiment d'être « vu » et reconnu dans l'espace public désamorce l'état d'alerte permanent de l'amygdale.
- **Protection cognitive :** Les personnes maintenant un réseau varié de liens faibles présentent une incidence significativement réduite du déclin cognitif lié à l'âge.

---

## 3. Le paradoxe de l'hyper-connexion moderne

Pourquoi souffrons-nous alors d'une épidémie de solitude alors que nous n'avons jamais été aussi joignables ?
Parce que les interactions asynchrones sur les réseaux sociaux (likes, commentaires superficiels) ne fournissent aucun des signaux somatiques indispensables à notre cerveau tribal : la voix vivante, le regard croisé, la synchronie posturale.

### 3 rituels pour réactiver vos liens faibles dès cette semaine :
1. **Le rituel du prénom :** Apprenez le prénom de deux personnes de votre environnement quotidien (accueil, cantine, voisin de palier) et saluez-les personnellement.
2. **Le message sans attente :** Envoyez un mot de trois lignes à une ancienne relation dont vous avez apprécié le travail récemment, sans rien lui demander en retour.
3. **La présence dans un tiers-lieu :** Travaillez ou lisez deux heures par semaine dans un espace public partagé plutôt que chez vous en télétravail isolé.`,
  };

  // CONTENU 4 : SAVOIR DIRE NON & LIMITES
  const media4 = {
    slug: "savoir-dire-non-sans-rompre-le-lien-guide-assertion",
    title: "Savoir Dire Non sans Rompre le Lien : Le Guide de l'Assertion Bienveillante",
    summary: "Poser des limites saines n'est pas un acte d'égoïsme, mais la condition première de relations durables, sincères et d'un équilibre intérieur retrouvé.",
    mediaType: "GUIDE" as const,
    coverImage: "/images/media/savoir-dire-non-limites.jpg",
    duration: 12,
    published: true,
    publishedAt: new Date("2026-10-05T08:30:00Z"),
    dimensionIqrh: "SELF" as const,
    content: `## La tyrannie du « Oui » par défaut

Vous reconnaissez-vous dans l'une de ces situations ?
- Accepter d'animer un atelier supplémentaire le vendredi à 18h alors que vous êtes au bord de l'épuisement.
- Répondre « avec plaisir ! » à une invitation familiale le week-end tout en ressentant un serrement d'angoisse au plexus.
- Reporter vos propres projets pour dépanner en urgence un ami qui a l'habitude d'externaliser ses crises.

Ce comportement porte un nom en psychologie relationnelle : la **complaisance d'évitement** (*people-pleasing*). Il prend racine dans une équation toxique intériorisée dès l'enfance : *« Si je pose une limite, je risque de décevoir ; et si je déçois, je ne serai plus aimé(e). »*

Le résultat est inévitable : à force de dire « Oui » aux autres, **vous dites un « Non » violent à votre propre santé relationnelle**.

---

## 1. Le coût caché du faux consentement

Quand vous acceptez une sollicitation à contrecœur, vous ne rendez service à personne :
- **Vous nourrissez le ressentiment :** Vous en voulez secrètement à la personne qui vous a sollicité, alors qu'elle n'a fait que formuler une demande.
- **Vous sabotez la confiance :** Vos proches finissent par douter de la sincérité de vos « Oui ». Un « Oui » qui n'a pas le pouvoir de dire « Non » n'a aucune valeur.
- **Vous détériorez votre score IER (Indice d'Équilibre Relationnel) :** Vos dimensions externes siphonnent l'énergie de votre dimension intérieure (**D5 : Relation à soi**).

---

## 2. La méthode du « Non sandwich » en 3 étapes

Pour refuser une demande sans agressivité et sans culpabilité, utilisez la structure du **sandwich relationnel** :

\`\`\`
Structure du Non bienveillant :
1. LE PAIN DU HAUT : Valider la relation et la légitimité de la demande
   « Je te remercie pour ta confiance / C'est une excellente initiative... »

2. LA GARNITURE : Le refus clair, sans justification superflue
   « Cependant, je ne pourrai pas m'en charger cette fois-ci car mes priorités 
     actuelles ne me le permettent pas. »

3. LE PAIN DU BAS : Proposer une alternative constructive (si pertinent)
   « En revanche, je peux te partager ma grille d'analyse d'ici demain / 
     on peut en reparler le mois prochain quand ma charge se sera stabilisée. »
\`\`\`

---

## 3. Les règles d'or de la posture assertrice

- **Ne vous confondez pas en excuses interminables :** Plus vous vous justifiez (*« J'ai mon chat malade, puis ma voiture... »*), plus vous donnez prise à la négociation. Un simple *« Mon emploi du temps ne me le permet pas »* est inattaquable.
- **Distinguez rejeter une demande et rejeter une personne :** Vous refusez une tâche ou un horaire, vous ne rejetez pas l'être humain en face.
- **Accueillez l'éventuelle déception de l'autre :** L'autre a le droit d'être déçu. Votre rôle est d'accueillir sa déception avec calme, pas de la réparer en capitulant sur vos limites.

> **Exercice réflexif :** Identifiez dans les dernières 48 heures une demande à laquelle vous auriez aimé dire non. Quel besoin fondamental de votre écologie personnelle avez-vous sacrifié ? Notez-le dans vos notes d'auto-compassion.`,
  };

  // CONTENU 5 : VIE DE COUPLE & ROUTINE AFFECTIVE
  const media5 = {
    slug: "desamorcer-pieges-routine-affective-couple-intimite",
    title: "Désamorcer les Pièges de la Routine Affective : Réenchanter la Curiosité dans le Couple",
    summary: "Comment dépasser l'illusion de la transparence et conjuguer sécurité d'attachement et intensité émotionnelle sur le long cours.",
    mediaType: "ARTICLE" as const,
    coverImage: "/images/media/routine-affective-couple.jpg",
    duration: 13,
    published: true,
    publishedAt: new Date("2026-10-06T10:00:00Z"),
    dimensionIqrh: "SENTIMENTAL" as const,
    content: `## L'illusion de la transparence : « Je te connais par cœur »

Il existe dans les couples de longue durée une phrase trompeuse qui marque souvent le début de l'érosion amoureuse : *« Après toutes ces années, je sais exactement ce qu'il/elle va dire ou penser. »*

Les psychologues spécialistes de la conjugalité appellent ce phénomène **l'illusion de transparence**. En croyant connaître parfaitement l'autre, nous cessons de le regarder avec curiosité. Nous interagissons non plus avec la personne réelle en constante évolution, mais avec un avatar mental figé que nous avons construit sur la base de ses habitudes passées.

Or, comme le rappelle la thérapeute **Esther Perel** :

> *« L'amour recherche la proximité et la sécurité ; mais le désir a besoin d'espace, d'inattendu et de mystère. Quand il n'y a plus rien à découvrir, il n'y a plus d'élan à cultiver. »*

---

## 1. La météo relationnelle du couple : Les 3 zones de vigilance

Dans l'évaluation de la **Dimension D3 (Vie sentimentale)** du bilan IQRH, les tensions de routine se manifestent par trois signaux avant-coureurs :

1. **La dérive logistique (Syndrome de la PME familiale) :** 90% des échanges tournent autour de l'intendance : les courses, les enfants, le loyer, l'agenda. Le couple d'amants s'est transformé en comité de direction domestique.
2. **Le silence confortable devenu indifférence :** Ne plus rien avoir à se dire n'est plus un signe de communion silencieuse, mais l'incapacité à ouvrir des conversations vulnérables.
3. **La certitude de l'acquis :** Cesser les micro-attentions quotidiennes qui nourrissent le réservoir affectif.

---

## 2. Le protocole des « 36 questions » réinventé

En 1997, le psychologue Arthur Aron a fasciné le monde scientifique en démontrant qu'il était possible de créer une intimité émotionnelle profonde et mesurable entre deux inconnus en 45 minutes grâce à une série de questions à vulnérabilité croissante.

Pour réenchanter le dialogue dans votre couple, mettez de côté les sujets d'organisation et posez-vous ces 4 questions lors d'un dîner en tête-à-tête :

- *« Quel est le rêve que tu as discrètement abandonné ces deux dernières années et dont nous ne parlons jamais ? »*
- *« Dans quel domaine as-tu l'impression d'avoir le plus changé intérieurement depuis notre rencontre ? »*
- *« Quel est le moment récent où tu t'es senti(e) le plus intensément vivant(e), même sans moi ? »*
- *« Comment puis-je être un meilleur soutien pour ta quête personnelle dans les six prochains mois ? »*

---

## 3. Préserver l'autonomie pour nourrir la rencontre

L'amour mature ne repose pas sur la fusion dépendante, mais sur ce que Murray Bowen nommait **la différenciation de soi** : la capacité à rester solidement soi-même tout en restant profondément connecté à l'autre.

Chaque partenaire a le devoir impérieux de cultiver son propre jardin secret, ses passions singulières et son cercle amical autonome. C'est précisément ce que chacun vit séparément qui alimente la richesse de ce qu'ils partagent lorsqu'ils se retrouvent.`,
  };

  // CONTENU 6 : PODCAST ÉPISODE 1 — BURNOUT RELATIONNEL
  const media6 = {
    slug: "podcast-ep1-quand-travail-epuise-coeur-burnout-relationnel",
    title: "Épisode 1 — Quand le Travail Épuise le Cœur : Sortir du Burnout Relationnel",
    summary: "Dans ce premier épisode audio immersif, Sarah Danvers raconte comment l'effondrement de ses relations au travail a précipité sa chute, et comment elle a reconstruit son capital relationnel pas à pas.",
    mediaType: "PODCAST" as const,
    coverImage: "/images/media/podcast-burnout-relationnel.jpg",
    audioUrl: "/audio/podcast-ep1-burnout-relationnel.mp3",
    duration: 32,
    published: true,
    publishedAt: new Date("2026-10-07T07:00:00Z"),
    dimensionIqrh: "PROFESSIONAL" as const,
    transcript: `[00:00] Générique audio LinkOffice — Pulsations calmes et piano ambiant.
[00:15] Présentateur : « Bienvenue dans Résonance, le podcast de LinkOffice dédié à la science et au vécu de nos relations humaines. Aujourd'hui, nous recevons Sarah Danvers. »
[01:02] Sarah Danvers : « Pendant quinze ans, j'ai cru que le travail ne demandait que des compétences techniques et de l'énergie. Je n'avais pas compris que 80% de mon énergie vitale était absorbée par la friction relationnelle non résolue... »
[08:24] « Le déclic est survenu un matin de réunion budgétaire. J'étais entourée de douze personnes, et je n'avais jamais ressenti une telle solitude dans toute ma vie. »
[15:40] « Comment j'ai reconstruit mon réseau grâce à la méthode du binôme relationnel... »
[28:10] Conclusion et conseils pratiques du Dr. Marc Vasseur.`,
    content: `## Synopsis de l'épisode

Le burnout est traditionnellement décrit comme un épuisement professionnel lié à la surcharge de travail. Mais dans plus de la moitié des cas cliniques, la véritable étincelle est d'ordre **relationnel** : le sentiment d'isolement, le manque de reconnaissance sincère, la toxicité des non-dits ou la disparition du sentiment d'appartenance.

Dans ce premier épisode de *Résonance*, **Sarah Danvers** (Directrice de transition et Témoin Éclaireur LinkOffice) livre un témoignage d'une lucidité rare sur les engrenages invisibles qui l'ont menée à la rupture, et sur le protocole méthodique qui lui a permis de restaurer son **Indice de Qualité des Relations Humaines (IQRH)**.

---

## Repères d'écoute & Chapitrage

- **00:00 – 05:20 :** Les signaux faibles : quand la messagerie professionnelle devient une source d'angoisse somatique.
- **05:21 – 12:45 :** L'illusion de l'invulnérabilité et le piège du management par le contrôle.
- **12:46 – 20:15 :** Le basculement : anatomie d'un épuisement relationnel aigu.
- **20:16 – 27:30 :** La reconstruction par petits pas : redéfinir ses limites et activer son binôme d'entraide.
- **27:31 – 32:40 :** L'analyse d'expert du Dr. Marc Vasseur : comment diagnostiquer à temps son Indice de Complexité Relationnelle (ICR).

---

## Les 3 enseignements clés à retenir

1. **La charge relationnelle est une charge physiologique :** Gérer des tensions tacites au quotidien fatigue autant l'organisme que plusieurs heures d'effort physique soutenu.
2. **Le premier pas vers la guérison est l'aveu de vulnérabilité :** Trouver un pair sécurisant (un binôme d'accountability) permet de désamorcer la honte de l'échec perçu.
3. **Le capital relationnel s'entretient comme un muscle :** Il nécessite des bilans réguliers, des rituels de protection et le courage de renégocier les contrats implicites dans son équipe.`,
  };

  const contentsToInsert = [
    {
      data: media1,
      categories: ["travail-cooperation", "iqrh-professionnel", "guides-pratiques", "transitions-pro"],
      eclaireurs: ["Dr. Marc Vasseur"],
    },
    {
      data: media2,
      categories: ["famille-proches", "iqrh-affectif", "gestion-tensions"],
      eclaireurs: ["Hélène de Saint-Germain"],
    },
    {
      data: media3,
      categories: ["lien-social-citoyennete", "iqrh-social", "analyses-chercheurs"],
      eclaireurs: ["Julien Rochefort"],
    },
    {
      data: media4,
      categories: ["estime-soi-limites", "iqrh-soi", "guides-pratiques", "charge-mentale-surcharge"],
      eclaireurs: ["Claire Benhamou"],
    },
    {
      data: media5,
      categories: ["couple-intimite", "iqrh-sentimental", "gestion-tensions"],
      eclaireurs: ["Dr. Antoine Mercier"],
    },
    {
      data: media6,
      categories: ["travail-cooperation", "iqrh-professionnel", "podcasts-ecoute", "sante-mentale-prevention"],
      eclaireurs: ["Sarah Danvers", "Dr. Marc Vasseur"],
    },
  ];

  for (const item of contentsToInsert) {
    const { data, categories: catSlugs, eclaireurs: eclNames } = item;

    // Connecter les catégories
    const catConnections = catSlugs
      .map((slug) => createdCategories[slug]?.id)
      .filter(Boolean)
      .map((id) => ({ id }));

    // Connecter les éclaireurs
    const eclConnections = eclNames
      .map((name) => createdEclaireurs[name]?.id)
      .filter(Boolean)
      .map((id) => ({ id }));

    const upserted = await prisma.mediaContent.upsert({
      where: { slug: data.slug },
      create: {
        ...data,
        categories: { connect: catConnections },
        eclaireurs: { connect: eclConnections },
      },
      update: {
        ...data,
        categories: { set: catConnections },
        eclaireurs: { set: eclConnections },
      },
    });

    console.log(`   ✓ [${upserted.mediaType}] "${upserted.title.slice(0, 48)}..." inséré avec succès.`);
  }

  // 4. Lier des articles connexes entre eux
  console.log("\n🔗 4. Configuration du maillage d'articles connexes...");
  const allInserted = await prisma.mediaContent.findMany({ select: { id: true, slug: true } });
  
  if (allInserted.length >= 2) {
    for (const art of allInserted) {
      const others = allInserted.filter((o) => o.id !== art.id).slice(0, 2);
      await prisma.mediaContent.update({
        where: { id: art.id },
        data: {
          linkedArticles: {
            set: others.map((o) => ({ id: o.id })),
          },
        },
      });
    }
    console.log("   ✓ Maillage des recommandations croisées établi.");
  }

  console.log("\n════════════════════════════════════════════════════════════════");
  console.log("   CORPUS ÉDITORIAL INSÉRÉ AVEC SUCCÈS DANS POSTGRESQL !        ");
  console.log("════════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ ERREUR LORS DU SEED MÉDIA :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
