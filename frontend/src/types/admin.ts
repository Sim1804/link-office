export type AdminTab =
  | 'dashboard'
  | 'devis'
  | 'organisations'
  | 'finances'
  | 'medias'
  | 'utilisateurs'
  | 'binomes'
  | 'catalogues'
  | 'securite';

export type PartnerType = 'Entreprises (B2B)' | 'Mutuelles (B2B2C)' | 'Collectivités (B2G)';

export interface OrganisationPartner {
  id: string;
  name: string;
  code: string;
  type: PartnerType;
  adminContact: {
    role: string;
    email: string;
    name?: string;
  };
  campaignsCount: number;
  usersCount: number;
  activeRate: number; // percentage
  iqrhScore: number;
  status: 'Actif' | 'En déploiement' | 'Audit';
  renewalDate: string;
}

export interface LeadQuote {
  id: string;
  companyName: string;
  type: PartnerType;
  contactName: string;
  contactEmail: string;
  estimatedUsers: number;
  requestedDate: string;
  budgetEstimated: string;
  status: 'En attente' | 'En qualification' | 'Converti';
  priority: 'Haute' | 'Normale' | 'Basse';
}

export interface CatalogItem {
  id: string;
  code: string;
  type: 'Micro-défis' | 'Recommandations' | 'Partenaires' | 'Questions IQRH' | 'Modules Adaptatifs';
  title: string;
  theme: string;
  targetCategory: string;
  points: number;
  difficulty: 'Facile' | 'Moyenne' | 'Avancée';
  status: 'Actif' | 'Archivé';
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'Article' | 'Podcast' | 'Fiche Pratique' | 'Recherche';
  status: 'Publié' | 'Brouillon';
  date: string;
  reads: number;
  author: string;
  category: string;
}

export interface BinomeRelation {
  id: string;
  pairName: string;
  orgName: string;
  status: 'Actif' | 'En évaluation' | 'Terminé';
  healthScore: number;
  startDate: string;
  lastInteraction: string;
  alertsCount: number;
}
