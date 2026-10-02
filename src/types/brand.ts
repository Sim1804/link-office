export interface ColorToken {
  name: string;
  role: string;
  meaning: string;
  hex: string;
  textColor: string;
  border?: string;
  bgClass: string;
  description: string;
}

export const BRAND_COLORS: ColorToken[] = [
  {
    name: 'LINK',
    role: 'Confiance Équilibre',
    meaning: 'Le vert d’eau LINK symbolise la confiance, la solidité relationnelle et l’équilibre des collectifs.',
    hex: '#00A99D',
    textColor: '#FFFFFF',
    bgClass: 'bg-[#00A99D]',
    description: 'Couleur primaire identitaire, présente sur les actions clés et le logo.'
  },
  {
    name: 'Clarté',
    role: 'Fluidité',
    meaning: 'Apporte transparence et limpidité dans la lecture des données humaines.',
    hex: '#199E9A',
    textColor: '#FFFFFF',
    bgClass: 'bg-[#199E9A]',
    description: 'Nuance secondaire pour les indicateurs de fluidité et les parcours.'
  },
  {
    name: 'Douceur',
    role: 'Ouverture',
    meaning: 'Évoque l’accueil, la bienveillance et l’absence de jugement.',
    hex: '#4DBDB2',
    textColor: '#123D46',
    bgClass: 'bg-[#4DBDB2]',
    description: 'Couleur tertiaire pour les fonds légers, les filtres et surbrillances.'
  },
  {
    name: 'Action',
    role: 'Transformation',
    meaning: 'Le violet d’action symbolise l’impulsion, l’audace du changement et le passage à l’acte.',
    hex: '#5965E8',
    textColor: '#FFFFFF',
    bgClass: 'bg-[#5965E8]',
    description: 'Accent dynamique pour les leviers d’action et étapes de transformation.'
  },
  {
    name: 'Lumière',
    role: 'Énergie',
    meaning: 'L’or lumineux incarne la révélation, l’énergie collective et l’éveil relationnel.',
    hex: '#FFC629',
    textColor: '#123D46',
    bgClass: 'bg-[#FFC629]',
    description: 'Point focal pour le point lumineux, les temps forts et les alertes positives.'
  },
  {
    name: 'Profondeur',
    role: 'Stabilité',
    meaning: 'Le bleu nuit canard apporte ancrage scientifique, rigueur et sérieux de recherche.',
    hex: '#123D46',
    textColor: '#FFFFFF',
    bgClass: 'bg-[#123D46]',
    description: 'Couleur de structure, typographies de titrage et fonds sombres.'
  },
  {
    name: 'Ivoire',
    role: 'Chaleur',
    meaning: 'Un neutre chaud et organique qui adoucit l’interface sans éblouir.',
    hex: '#F4F1E8',
    textColor: '#123D46',
    border: '#E2DCD0',
    bgClass: 'bg-[#F4F1E8]',
    description: 'Fond doux, cartes de contenu, respiration visuelle.'
  },
  {
    name: 'Sérénité',
    role: 'Apaisement',
    meaning: 'Teinte sauge pâle favorisant la concentration, l’écoute et le calme réflexif.',
    hex: '#E3EBE6',
    textColor: '#123D46',
    border: '#C8D8CE',
    bgClass: 'bg-[#E3EBE6]',
    description: 'Fonds d’espaces de diagnostic, séparateurs subtils et badges doux.'
  }
];

export interface BrandValue {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  iconName: 'humain' | 'clarte' | 'fiabilite' | 'action';
}

export const BRAND_VALUES: BrandValue[] = [
  {
    id: 'humain',
    name: 'HUMAIN',
    tagline: 'Le lien au cœur de tout',
    description: 'L’humain n’est pas une variable d’ajustement mais le fondement même de la vitalité des organisations et de la société.',
    color: '#00A99D',
    iconName: 'humain'
  },
  {
    id: 'clarte',
    name: 'CLARTÉ',
    tagline: 'Rendre visible ce qui compte',
    description: 'Traduire la complexité relationnelle en repères visuels compréhensibles par tous, sans déformer ni masquer les vulnérabilités.',
    color: '#199E9A',
    iconName: 'clarte'
  },
  {
    id: 'fiabilite',
    name: 'FIABILITÉ',
    tagline: 'Mesurer avec rigueur',
    description: 'Une méthodologie d’observation scientifique issue de la recherche sociologique et des sciences comportementales.',
    color: '#FFC629',
    iconName: 'fiabilite'
  },
  {
    id: 'action',
    name: 'ACTION',
    tagline: 'Transformer les relations',
    description: 'Mesurer ne suffit pas : nous outillons les collectifs pour initier des micro-transformations durables au quotidien.',
    color: '#5965E8',
    iconName: 'action'
  }
];

export interface IQRHQuestion {
  id: number;
  pillar: string;
  category: string;
  question: string;
  explanation: string;
  options: {
    label: string;
    points: number;
  }[];
}

export const IQRH_QUESTIONS: IQRHQuestion[] = [
  {
    id: 1,
    pillar: 'Confiance & Sécurité',
    category: 'Moi / Nous',
    question: 'Dans quelle mesure vous sentez-vous libre d’exprimer un désaccord ou un doute sans crainte de jugement au sein de votre équipe ?',
    explanation: 'La sécurité psychologique est le premier prédicteur de la santé relationnelle d’un groupe.',
    options: [
      { label: 'Rarement ou jamais : la réserve prédomine', points: 30 },
      { label: 'Parfois, selon la présence de certains collègues', points: 55 },
      { label: 'Souvent : le dialogue est généralement ouvert', points: 78 },
      { label: 'Toujours : la divergence est accueillie avec bienveillance', points: 95 }
    ]
  },
  {
    id: 2,
    pillar: 'Clarté des Échanges',
    category: 'Observation & Écoute',
    question: 'Comment qualifieriez-vous la limpidité des informations et la franchise des retours au quotidien ?',
    explanation: 'Une information fluide et non-biaisée réduit l’anxiété et prévient les non-dits.',
    options: [
      { label: 'Floue et souvent sujette à interprétation', points: 35 },
      { label: 'Correcte mais avec des zones d’ombre récurrentes', points: 60 },
      { label: 'Claire, partagée de manière transparente', points: 80 },
      { label: 'Exemplaire : feedback continu et constructif', points: 95 }
    ]
  },
  {
    id: 3,
    pillar: 'Soutien & Entraide',
    category: 'Bienveillance & Respect',
    question: 'Face à une charge de travail imprévue ou une difficulté personnelle, sur quel soutien pouvez-vous compter ?',
    explanation: 'L’entraide spontanée est le ciment de la résilience collective.',
    options: [
      { label: 'Chacun pour soi dans l’urgence', points: 25 },
      { label: 'Soutien ponctuel mais informel', points: 58 },
      { label: 'Entraide réelle et organisée entre pairs', points: 82 },
      { label: 'Solidarité inconditionnelle et réflexe collectif', points: 98 }
    ]
  },
  {
    id: 4,
    pillar: 'Alignement & Coopération',
    category: 'Mesure & Compréhension',
    question: 'Les relations entre départements ou métiers favorisent-elles la réalisation des objectifs partagés ?',
    explanation: 'La coopération transverse mesure la perméabilité des silos au service du bien commun.',
    options: [
      { label: 'Tensions fréquentes ou logique de silos étanches', points: 30 },
      { label: 'Collaboration minimale dictée par les processus', points: 55 },
      { label: 'Bonne coopération avec un esprit d’équipe réel', points: 76 },
      { label: 'Synergie naturelle et co-construction fluide', points: 92 }
    ]
  },
  {
    id: 5,
    pillar: 'Capacité d’Action',
    category: 'Action & Transformation',
    question: 'Lorsque des dysfonctionnements relationnels sont identifiés, quelle est la capacité du collectif à agir concrètement ?',
    explanation: 'La mesure sans action génère de la frustration ; l’action concrète rétablit l’équilibre.',
    options: [
      { label: 'Les problèmes restent lettre morte ou sont évités', points: 20 },
      { label: 'Des discussions ont lieu mais peu de suivi', points: 50 },
      { label: 'Des plans d’ajustement sont testés avec succès', points: 79 },
      { label: 'Agilité relationnelle et résolution collaborative continue', points: 96 }
    ]
  }
];
