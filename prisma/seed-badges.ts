import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  }
];

async function main() {
  console.log("🏅 Début du seeding des Badges...");

  for (const badge of badges) {
    const existing = await prisma.badge.findUnique({
      where: { name: badge.name },
    });

    if (!existing) {
      await prisma.badge.create({
        data: badge,
      });
      console.log(`✅ Badge créé : ${badge.name}`);
    } else {
      console.log(`ℹ️ Badge existant ignoré : ${badge.name}`);
    }
  }

  console.log("🎉 Seeding des Badges terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
