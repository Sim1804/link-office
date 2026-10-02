import React, { useState } from 'react';
import { Logo } from '../brand/Logo';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
  Wallet,
  Newspaper,
  Users,
  Handshake,
  FolderTree,
  ShieldCheck,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BarChart3,
  ExternalLink,
  Filter,
  Lock,
  RefreshCw,
  LogOut,
  X
} from 'lucide-react';
import {
  AdminTab,
  PartnerType,
  OrganisationPartner,
  LeadQuote,
  CatalogItem,
  MediaItem,
  BinomeRelation
} from '../../types/admin';

interface AdminBackOfficeProps {
  onReturnToPublic: () => void;
  onSwitchToEmployeeDemo?: () => void;
  onSwitchToRHAdmin?: () => void;
}

export const AdminBackOffice: React.FC<AdminBackOfficeProps> = ({
  onReturnToPublic,
  onSwitchToEmployeeDemo,
  onSwitchToRHAdmin
}) => {
  // Top level mode: 'console' (Super Admin) or 'partenaires' (simulation of partner portails)
  const [topMode, setTopMode] = useState<'console' | 'partenaires'>('console');
  const [selectedPartnerPortal, setSelectedPartnerPortal] = useState<string>('acme');

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Sub-tab toggles in Dashboard 360
  const [dashboardSubTab, setDashboardSubTab] = useState<'generale' | 'barometre'>('generale');

  // Sub-tab toggles in Devis
  const [devisSubTab, setDevisSubTab] = useState<'attente' | 'convertis'>('attente');

  // Sub-tab toggles in Catalogues
  const [catalogSubTab, setCatalogSubTab] = useState<string>('Tout voir');

  // Search queries
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications drawer / popup state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  // Modals state
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isAddCatalogOpen, setIsAddCatalogOpen] = useState(false);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [selectedOrgDetails, setSelectedOrgDetails] = useState<OrganisationPartner | null>(null);

  // ==================== STATEFUL MOCK DATA (Matches user screenshots & charte) ====================

  // 1. Organisations Partners
  const [organisations, setOrganisations] = useState<OrganisationPartner[]>([
    {
      id: 'org-1',
      name: 'Ville de Testville (Collectivité)',
      code: 'VILLE-2026-TEST',
      type: 'Collectivités (B2G)',
      adminContact: {
        role: 'Direction Générale des Services',
        email: 'dgs@ville-testville.fr',
        name: 'Émilie Renaud'
      },
      campaignsCount: 1,
      usersCount: 13,
      activeRate: 92,
      iqrhScore: 74.2,
      status: 'Actif',
      renewalDate: '15/12/2026'
    },
    {
      id: 'org-2',
      name: 'Mutuelle Solis (B2B2C Test)',
      code: 'MUTU-2026-TEST',
      type: 'Mutuelles (B2B2C)',
      adminContact: {
        role: 'Gestionnaire Mutuelle & Prévention',
        email: 'admin.b2b2c@linkoffice.fr',
        name: 'Marc Levêque'
      },
      campaignsCount: 1,
      usersCount: 13,
      activeRate: 85,
      iqrhScore: 81.6,
      status: 'Actif',
      renewalDate: '01/10/2026'
    },
    {
      id: 'org-3',
      name: 'Acme Corp (B2B Test)',
      code: 'ACME-2026-TEST',
      type: 'Entreprises (B2B)',
      adminContact: {
        role: 'DRH & Qualité de Vie au Travail',
        email: 'admin.b2b@linkoffice.fr',
        name: 'Sophie Laurent'
      },
      campaignsCount: 1,
      usersCount: 13,
      activeRate: 96,
      iqrhScore: 68.9,
      status: 'Actif',
      renewalDate: '30/09/2026'
    }
  ]);

  // New partner form inputs
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCode, setNewOrgCode] = useState('');
  const [newOrgType, setNewOrgType] = useState<PartnerType>('Entreprises (B2B)');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgUsers, setNewOrgUsers] = useState('25');

  // 2. Leads / Devis
  const [leads, setLeads] = useState<LeadQuote[]>([
    {
      id: 'lead-101',
      companyName: 'Groupe Aéronautique Méridien',
      type: 'Entreprises (B2B)',
      contactName: 'Philippe Bertin',
      contactEmail: 'p.bertin@meridien-aero.com',
      estimatedUsers: 450,
      requestedDate: 'Hier, 16:40',
      budgetEstimated: '14 200 € / an',
      status: 'En attente',
      priority: 'Haute'
    },
    {
      id: 'lead-102',
      companyName: 'Harmonie Santé & Territoires',
      type: 'Mutuelles (B2B2C)',
      contactName: 'Claire Dutertre',
      contactEmail: 'c.dutertre@harmoniesante.fr',
      estimatedUsers: 1200,
      requestedDate: '28 Septembre',
      budgetEstimated: '28 500 € / an',
      status: 'En qualification',
      priority: 'Haute'
    },
    {
      id: 'lead-103',
      companyName: 'Communauté d’Agglomération Ouest-Littoral',
      type: 'Collectivités (B2G)',
      contactName: 'Yannick Morel',
      contactEmail: 'y.morel@agglo-littoral.fr',
      estimatedUsers: 180,
      requestedDate: '24 Septembre',
      budgetEstimated: '7 800 € / an',
      status: 'Converti',
      priority: 'Normale'
    }
  ]);

  // 3. Central Catalog (Items from user screenshot 5)
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([
    {
      id: 'cat-1',
      code: 'DEF005',
      type: 'Micro-défis',
      title: 'Créer un moment sans écran',
      theme: 'Émotion & Déconnexion',
      targetCategory: 'Émotion',
      points: 20,
      difficulty: 'Facile',
      status: 'Actif'
    },
    {
      id: 'cat-2',
      code: 'DEF006',
      type: 'Micro-défis',
      title: 'Préparer une conversation importante',
      theme: 'Communication non-violente',
      targetCategory: 'Couple / Binôme',
      points: 35,
      difficulty: 'Moyenne',
      status: 'Actif'
    },
    {
      id: 'cat-3',
      code: 'DEF007',
      type: 'Micro-défis',
      title: 'Demander un relais',
      theme: 'Charge mentale & Entraide',
      targetCategory: 'Émotion',
      points: 35,
      difficulty: 'Moyenne',
      status: 'Actif'
    },
    {
      id: 'cat-4',
      code: 'DEF008',
      type: 'Micro-défis',
      title: 'Bloquer un temps pour soi',
      theme: 'Respiration & Frontière vie pro/perso',
      targetCategory: 'Émotion',
      points: 20,
      difficulty: 'Facile',
      status: 'Actif'
    },
    {
      id: 'cat-5',
      code: 'REC012',
      type: 'Recommandations',
      title: 'Rituel du Débrief Miroir (15 min)',
      theme: 'Régulation interpersonnelle',
      targetCategory: 'Managers',
      points: 50,
      difficulty: 'Facile',
      status: 'Actif'
    },
    {
      id: 'cat-6',
      code: 'IQR001',
      type: 'Questions IQRH',
      title: 'Sécurité psychologique & droit à l’erreur',
      theme: 'Pilier Confiance',
      targetCategory: 'Collectif',
      points: 10,
      difficulty: 'Facile',
      status: 'Actif'
    }
  ]);

  // New catalog item input state
  const [newCatalogTitle, setNewCatalogTitle] = useState('');
  const [newCatalogType, setNewCatalogType] = useState<CatalogItem['type']>('Micro-défis');
  const [newCatalogTheme, setNewCatalogTheme] = useState('Émotion');
  const [newCatalogPoints, setNewCatalogPoints] = useState('25');
  const [newCatalogDifficulty, setNewCatalogDifficulty] = useState<CatalogItem['difficulty']>('Facile');

  // 4. Media Library (CMS)
  const [medias, setMedias] = useState<MediaItem[]>([
    {
      id: 'med-1',
      title: 'Le lien humain, premier bouclier contre l’épuisement professionnel',
      type: 'Article',
      status: 'Publié',
      date: '28/09/2026',
      reads: 1420,
      author: 'Comité Scientifique LINK OFFICE',
      category: 'Sociologie du travail'
    },
    {
      id: 'med-2',
      title: 'Podcast Épisode #4 : Restaurer la confiance après une crise managériale',
      type: 'Podcast',
      status: 'Publié',
      date: '22/09/2026',
      reads: 890,
      author: 'Dr. Anne-Sophie V.',
      category: 'Management'
    },
    {
      id: 'med-3',
      title: 'Guide méthodologique : Déployer le Baromètre IQRH en toute conformité RGPD',
      type: 'Fiche Pratique',
      status: 'Publié',
      date: '15/09/2026',
      reads: 2310,
      author: 'Pôle Juridique & Éthique',
      category: 'Déontologie'
    }
  ]);

  // 5. Binômes (Screenshot 4)
  const [binomes] = useState<BinomeRelation[]>([
    {
      id: 'bin-1',
      pairName: 'Collaborateur A71 & Manager M12',
      orgName: 'Acme Corp (B2B Test)',
      status: 'Actif',
      healthScore: 84,
      startDate: '12/08/2026',
      lastInteraction: 'Aujourd’hui',
      alertsCount: 0
    },
    {
      id: 'bin-2',
      pairName: 'Référent R34 & Salarié S89',
      orgName: 'Mutuelle Solis (B2B2C Test)',
      status: 'Actif',
      healthScore: 71,
      startDate: '01/09/2026',
      lastInteraction: 'Il y a 2 jours',
      alertsCount: 1
    },
    {
      id: 'bin-3',
      pairName: 'Agent Municipal T04 & Responsable Pôle',
      orgName: 'Ville de Testville (Collectivité)',
      status: 'En évaluation',
      healthScore: 62,
      startDate: '19/09/2026',
      lastInteraction: 'Hier',
      alertsCount: 2
    }
  ]);

  // Calculations for stats
  const totalOrganizations = organisations.length;
  const totalUsers = organisations.reduce((acc, curr) => acc + curr.usersCount, 0) + 14;
  const pendingQuotes = leads.filter(l => l.status === 'En attente').length;
  const activeMedias = medias.filter(m => m.status === 'Publié').length;

  // Handlers
  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    const newPartner: OrganisationPartner = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      code: newOrgCode || `${newOrgName.substring(0, 4).toUpperCase()}-2026`,
      type: newOrgType,
      adminContact: {
        role: 'Contact Référent',
        email: newOrgEmail || `contact@${newOrgName.toLowerCase().replace(/[^a-z]/g, '')}.fr`,
        name: 'Administrateur Délégué'
      },
      campaignsCount: 1,
      usersCount: parseInt(newOrgUsers, 10) || 10,
      activeRate: 100,
      iqrhScore: 72.0,
      status: 'En déploiement',
      renewalDate: '01/10/2027'
    };
    setOrganisations([newPartner, ...organisations]);
    setIsAddPartnerOpen(false);
    setNewOrgName('');
    setNewOrgCode('');
    setNewOrgEmail('');
  };

  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatalogTitle) return;
    const newItem: CatalogItem = {
      id: `cat-${Date.now()}`,
      code: `DEF00${catalogItems.length + 5}`,
      type: newCatalogType,
      title: newCatalogTitle,
      theme: newCatalogTheme,
      targetCategory: 'Émotion',
      points: parseInt(newCatalogPoints, 10) || 20,
      difficulty: newCatalogDifficulty,
      status: 'Actif'
    };
    setCatalogItems([newItem, ...catalogItems]);
    setIsAddCatalogOpen(false);
    setNewCatalogTitle('');
  };

  const handleDeleteCatalogItem = (id: string) => {
    setCatalogItems(catalogItems.filter(item => item.id !== id));
  };

  const handleConvertLead = (leadId: string) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'Converti' } : l));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#123D46] font-inter flex flex-col selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      {/* ==================== 1. TOP HEADER (Identique aux captures d'écran mais sublimé) ==================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-[1480px] mx-auto flex items-center justify-between">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-4">
            <div onClick={onReturnToPublic} className="cursor-pointer hover:opacity-90 transition-opacity">
              <Logo size="sm" showTagline={false} />
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E3EBE6]">
              <span className="text-[11px] font-jakarta font-bold px-2 py-0.5 rounded-md bg-[#123D46]/5 text-[#123D46] uppercase tracking-wider">
                Console Gouvernance
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] animate-pulse" />
            </div>
          </div>

          {/* Center: Top Level Switcher (Console Administrateur vs Portails Partenaires) */}
          <nav className="flex items-center gap-4 sm:gap-8 font-jakarta text-sm font-semibold">
            <button
              onClick={() => setTopMode('console')}
              className={`relative py-2 transition-colors ${
                topMode === 'console'
                  ? 'text-[#00A99D] font-bold'
                  : 'text-[#123D46]/60 hover:text-[#123D46]'
              }`}
            >
              <span>Console administrateur</span>
              {topMode === 'console' && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00A99D] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setTopMode('partenaires')}
              className={`relative py-2 transition-colors ${
                topMode === 'partenaires'
                  ? 'text-[#00A99D] font-bold'
                  : 'text-[#123D46]/60 hover:text-[#123D46]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>Portails partenaires</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#5965E8]/10 text-[#5965E8] font-bold">
                  B2B / B2G
                </span>
              </div>
              {topMode === 'partenaires' && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00A99D] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right: Notifications & Super Admin Profile */}
          <div className="flex items-center gap-3 relative">
            {/* Quick public return link */}
            <button
              onClick={onReturnToPublic}
              className="hidden lg:inline-flex items-center gap-1 text-xs text-[#123D46]/60 hover:text-[#00A99D] font-medium mr-2"
              title="Retourner au site public SaaS"
            >
              <span>Site public</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFC629] ring-2 ring-white animate-pulse" />
              </button>

              {/* Notification Drawer Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E3EBE6] rounded-2xl shadow-xl p-4 z-50 animate-scale-in text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3EBE6]">
                    <span className="font-jakarta font-bold text-[#123D46]">Centre de Notifications</span>
                    <span className="text-[10px] font-bold text-[#00A99D] bg-[#00A99D]/10 px-2 py-0.5 rounded-full">
                      2 non lues
                    </span>
                  </div>
                  <div className="divide-y divide-[#E3EBE6]/60 mt-2 max-h-60 overflow-y-auto space-y-2">
                    <div className="pt-2 text-[#123D46]">
                      <div className="flex items-center gap-1.5 font-bold text-[#123D46]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D]" />
                        <span>Nouveau devis entrant</span>
                      </div>
                      <p className="text-[11px] text-[#123D46]/70 mt-0.5">
                        Groupe Méridien (450 salariés) a demandé un chiffrage B2B.
                      </p>
                      <span className="text-[10px] text-[#123D46]/40">Hier à 16:40</span>
                    </div>
                    <div className="pt-2 text-[#123D46]">
                      <div className="flex items-center gap-1.5 font-bold text-[#123D46]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5965E8]" />
                        <span>Campagne Ville de Testville</span>
                      </div>
                      <p className="text-[11px] text-[#123D46]/70 mt-0.5">
                        Taux de participation atteint 92% (12/13 réponses).
                      </p>
                      <span className="text-[10px] text-[#123D46]/40">Il y a 3 heures</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Super Admin Profile Pill (Exactement comme dans les images fournies) */}
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E3EBE6] bg-white hover:bg-[#F4F1E8]/40 transition-colors shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#00A99D] text-white font-jakarta font-bold text-xs flex items-center justify-center">
                  S
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-xs font-jakarta font-bold text-[#123D46]">Super Admin</div>
                  <div className="text-[10px] text-[#00A99D] font-medium">Super administrateur</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#123D46]/50 ml-1" />
              </button>

              {/* Profile Dropdown */}
              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E3EBE6] rounded-2xl shadow-xl p-3 z-50 animate-scale-in text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-[#E3EBE6]">
                    <div className="font-bold text-[#123D46]">Camille V. (Fondateur)</div>
                    <div className="text-[11px] text-[#123D46]/60">superadmin@linkoffice.fr</div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#00A99D] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Privilèges Root · RGPD Master</span>
                    </div>
                  </div>

                  {onSwitchToRHAdmin && (
                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        onSwitchToRHAdmin();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#123D46] hover:bg-[#00A99D]/10 hover:text-[#00A99D] font-medium transition-colors flex items-center gap-2"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#00A99D]" />
                      <span>Espace RH Admin (Acme Corp)</span>
                    </button>
                  )}

                  {onSwitchToEmployeeDemo && (
                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        onSwitchToEmployeeDemo();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#123D46] hover:bg-[#00A99D]/10 hover:text-[#00A99D] font-medium transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Voir le Dashboard Salarié</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowAdminMenu(false);
                      onReturnToPublic();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Quitter la console</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================== 2. HORIZONTAL SUB-NAVIGATION TABS (9 Modules Clés) ==================== */}
      <div className="bg-white border-b border-[#E3EBE6] px-4 sm:px-8 overflow-x-auto scrollbar-none py-2.5">
        <div className="max-w-[1480px] mx-auto flex items-center gap-1.5 sm:gap-2">
          {/* 1. Dashboard 360 */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#00A99D]/10 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard 360</span>
          </button>

          {/* 2. Devis */}
          <button
            onClick={() => setActiveTab('devis')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
              activeTab === 'devis'
                ? 'bg-[#00A99D]/10 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Devis</span>
            {pendingQuotes > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FFC629] text-[#123D46] text-[10px] font-bold flex items-center justify-center">
                {pendingQuotes}
              </span>
            )}
          </button>

          {/* 3. Organisations */}
          <button
            onClick={() => setActiveTab('organisations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
              activeTab === 'organisations'
                ? 'bg-[#00A99D]/10 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organisations</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#123D46]/5 text-[#123D46]/70 font-mono">
              {organisations.length}
            </span>
          </button>

          {/* 4. Finances */}
          <button
            onClick={() => setActiveTab('finances')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
              activeTab === 'finances'
                ? 'bg-[#00A99D]/10 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/60'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Finances</span>
          </button>

          {/* 5. Médias */}
          <button
            onClick={() => setActiveTab('medias')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
              activeTab === 'medias'
                ? 'bg-[#00A99D]/10 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/60'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Médias</span>
          </button>

          {/* 6. Utilisateurs */}
          <button
            onClick={() => setActiveTab('utilisateurs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
              activeTab === 'utilisateurs'
                ? 'bg-[#00A99D]/10 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Utilisateurs</span>
          </button>

          {/* 7. Binômes */}
          <button
            onClick={() => setActiveTab('binomes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
              activeTab === 'binomes'
                ? 'bg-[#00A99D]/10 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/60'
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span>Binômes</span>
          </button>

          {/* 8. Catalogues */}
          <button
            onClick={() => setActiveTab('catalogues')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
              activeTab === 'catalogues'
                ? 'bg-[#00A99D]/10 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/60'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Catalogues</span>
          </button>

          {/* 9. Sécurité */}
          <button
            onClick={() => setActiveTab('securite')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
              activeTab === 'securite'
                ? 'bg-[#00A99D]/10 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sécurité</span>
          </button>
        </div>
      </div>

      {/* ==================== 3. MAIN WORKSPACE CONTENT ==================== */}
      <main className="flex-1 max-w-[1480px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">

        {/* -------------------- VIEW A: PORTAILS PARTENAIRES SWITCHER VIEW -------------------- */}
        {topMode === 'partenaires' ? (
          <div className="space-y-6">
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EBE6]">
                <div>
                  <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                    Portails Partenaires Dédiés
                  </h1>
                  <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                    Supervision des espaces cloisonnés par client : Entreprises (B2B), Mutuelles (B2B2C) et Collectivités (B2G).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#123D46]/60">Choisir le portail actif :</span>
                  <select
                    value={selectedPartnerPortal}
                    onChange={(e) => setSelectedPartnerPortal(e.target.value)}
                    className="text-xs font-jakarta font-bold bg-[#F4F1E8] border border-[#E3EBE6] rounded-xl px-3 py-2 text-[#123D46]"
                  >
                    <option value="acme">Acme Corp (B2B)</option>
                    <option value="mutuelle">Mutuelle Solis (B2B2C)</option>
                    <option value="ville">Ville de Testville (Collectivité)</option>
                  </select>
                </div>
              </div>

              {/* Partner View Simulation */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00A99D]">STATISTIQUES DE CAMPAGNE</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-3xl font-jakarta font-black text-[#123D46]">94.8%</div>
                  <p className="text-xs text-[#123D46]/70">
                    Taux d’engagement anonymisé au Baromètre IQRH ce trimestre.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5965E8]">INDICE IQRH GLOBAL</span>
                    <TrendingUp className="w-4 h-4 text-[#5965E8]" />
                  </div>
                  <div className="text-3xl font-jakarta font-black text-[#123D46]">73.4 <span className="text-sm font-normal text-[#123D46]/50">/ 100</span></div>
                  <p className="text-xs text-[#123D46]/70">
                    +4.2 pts depuis le lancement des ateliers de feedback structurés.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FFC629]">RESPECT DU K-ANONYMAT</span>
                    <ShieldCheck className="w-4 h-4 text-[#00A99D]" />
                  </div>
                  <div className="text-3xl font-jakarta font-black text-[#123D46]">N &ge; 5</div>
                  <p className="text-xs text-[#123D46]/70">
                    Garantie mathématique : aucune sous-équipe de moins de 5 personnes n'est isolée.
                  </p>
                </div>
              </div>

              {/* Action Banner */}
              <div className="mt-8 p-4 rounded-xl bg-[#00A99D]/5 border border-[#00A99D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#00A99D] shrink-0" />
                  <span className="text-xs text-[#123D46] font-medium">
                    Vous visualisez la console en mode simulation partenaire. Les données ci-dessus sont cloisonnées.
                  </span>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {onSwitchToRHAdmin && (
                    <button
                      onClick={onSwitchToRHAdmin}
                      className="px-3.5 py-1.5 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Ouvrir l'Espace RH Dédié (Acme Corp) →</span>
                    </button>
                  )}
                  <button
                    onClick={() => setTopMode('console')}
                    className="text-xs font-jakarta font-bold text-[#123D46]/70 hover:text-[#123D46] underline"
                  >
                    Revenir à la console Super Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* -------------------- VIEW 1: DASHBOARD 360 (Image 1) -------------------- */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight">
                      Gouvernance & Laboratoire du Lien Humain
                    </h1>
                    <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1 font-inter">
                      Pilotage unifié · Modélisation IQRH · Pipeline commercial · Co-pilotage IRIS
                    </p>
                  </div>

                  {/* Sub-tabs toggle: Vue Générale vs Baromètre National */}
                  <div className="inline-flex p-1 bg-white border border-[#E3EBE6] rounded-xl self-start sm:self-auto shadow-2xs">
                    <button
                      onClick={() => setDashboardSubTab('generale')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-jakarta font-semibold transition-colors ${
                        dashboardSubTab === 'generale'
                          ? 'bg-[#00A99D]/15 text-[#00A99D]'
                          : 'text-[#123D46]/70 hover:text-[#123D46]'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Vue Générale</span>
                    </button>
                    <button
                      onClick={() => setDashboardSubTab('barometre')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-jakarta font-semibold transition-colors ${
                        dashboardSubTab === 'barometre'
                          ? 'bg-[#00A99D]/15 text-[#00A99D]'
                          : 'text-[#123D46]/70 hover:text-[#123D46]'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Baromètre National</span>
                    </button>
                  </div>
                </div>

                {/* 4 Stat KPI Cards (Image 1 - Avec bordure gauche couleur exacte) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Card 1: Organisations (Teal #00A99D) */}
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00A99D] rounded-r" />
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-jakarta font-bold text-[#123D46]/75 uppercase tracking-wider">
                        ORGANISATIONS
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                        {totalOrganizations}
                      </span>
                      <span className="text-[11px] font-jakarta font-bold text-[#00A99D] bg-[#00A99D]/10 px-1.5 py-0.5 rounded">
                        +12% T1
                      </span>
                    </div>
                    <p className="text-xs text-[#123D46]/60 mt-2">
                      1 B2B · 1 Mutuelles · 1 Collectivités
                    </p>
                  </div>

                  {/* Card 2: Devis Entrants (Gold #FFC629) */}
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FFC629] rounded-r" />
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-jakarta font-bold text-[#123D46]/75 uppercase tracking-wider">
                        DEVIS ENTRANTS
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-[#FFC629]/15 text-[#123D46] flex items-center justify-center">
                        <Handshake className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                        {pendingQuotes}
                      </span>
                      <span className="text-[11px] font-jakarta font-medium text-[#123D46]/60">
                        en attente
                      </span>
                    </div>
                    <p className="text-xs text-[#123D46]/60 mt-2">
                      {pendingQuotes === 0 ? 'Tous traités · Aucun en attente' : `${pendingQuotes} nouvelle demande à qualifier`}
                    </p>
                  </div>

                  {/* Card 3: Comptes Rattachés (Action Violet #5965E8) */}
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#5965E8] rounded-r" />
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-jakarta font-bold text-[#123D46]/75 uppercase tracking-wider">
                        COMPTES RATTACHÉS
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                        {totalUsers}
                      </span>
                      <span className="text-[11px] font-jakarta font-bold text-[#5965E8] bg-[#5965E8]/10 px-1.5 py-0.5 rounded">
                        +8 ce mois
                      </span>
                    </div>
                    <p className="text-xs text-[#123D46]/60 mt-2">
                      Employés, DRH et bénéficiaires
                    </p>
                  </div>

                  {/* Card 4: Médias Actifs (Teal #199E9A) */}
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#199E9A] rounded-r" />
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-jakarta font-bold text-[#123D46]/75 uppercase tracking-wider">
                        MÉDIAS ACTIFS
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-[#199E9A]/10 text-[#199E9A] flex items-center justify-center">
                        <Newspaper className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                        {activeMedias}
                      </span>
                      <span className="text-[11px] font-jakarta font-medium text-[#123D46]/60">
                        en ligne
                      </span>
                    </div>
                    <p className="text-xs text-[#123D46]/60 mt-2">
                      Articles, podcasts et recommandations
                    </p>
                  </div>
                </div>

                {/* Sub-view: Vue Générale vs Baromètre National */}
                {dashboardSubTab === 'generale' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pipeline Entrant (Directement inspiré de la capture 1) */}
                    <div className="lg:col-span-2 bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#FFC629]/20 text-[#123D46] flex items-center justify-center">
                            <Handshake className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="text-sm font-jakarta font-bold text-[#123D46]">
                              Pipeline Entrant
                            </h2>
                            <p className="text-[11px] text-[#123D46]/60">
                              Nouvelles demandes et opportunités B2B à traiter
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('devis')}
                          className="text-xs font-jakarta font-bold text-[#00A99D] hover:underline flex items-center gap-1"
                        >
                          <span>Voir tout</span>
                          <span>&rsaquo;</span>
                        </button>
                      </div>

                      {/* Leads List */}
                      <div className="space-y-3">
                        {leads.map((lead) => (
                          <div
                            key={lead.id}
                            className="p-4 rounded-xl border border-[#E3EBE6] hover:border-[#00A99D]/40 bg-[#F8F9FA]/60 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-jakarta font-bold text-sm text-[#123D46]">
                                  {lead.companyName}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#123D46]/5 text-[#123D46] font-medium">
                                  {lead.type}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  lead.status === 'En attente'
                                    ? 'bg-[#FFC629]/20 text-[#123D46]'
                                    : lead.status === 'En qualification'
                                    ? 'bg-[#5965E8]/10 text-[#5965E8]'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {lead.status}
                                </span>
                              </div>
                              <p className="text-xs text-[#123D46]/70">
                                Contact : <span className="font-medium text-[#123D46]">{lead.contactName}</span> ({lead.contactEmail}) · Volume estimé : <span className="font-mono font-medium">{lead.estimatedUsers} salariés</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <span className="text-xs font-mono font-bold text-[#00A99D] bg-[#00A99D]/10 px-2.5 py-1 rounded-lg">
                                {lead.budgetEstimated}
                              </span>
                              {lead.status !== 'Converti' ? (
                                <button
                                  onClick={() => handleConvertLead(lead.id)}
                                  className="text-xs font-jakarta font-bold px-3 py-1.5 rounded-xl bg-[#00A99D] text-white hover:bg-[#199E9A] transition-colors shadow-2xs"
                                >
                                  Convertir
                                </button>
                              ) : (
                                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Compte Actif</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column: Governance & Health Index Box */}
                    <div className="bg-[#123D46] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-jakarta font-bold text-[#FFC629] tracking-wider uppercase">
                            ÉTAT DU LABORATOIRE
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-jakarta font-bold">
                          Conformité Déontologique & RGPD
                        </h3>
                        <p className="text-xs text-white/80 leading-relaxed">
                          Toutes les métriques agrégées respectent le principe de k-anonymat strict (N &ge; 5). Aucun signal individuel n'est accessible par la gouvernance ou les employeurs.
                        </p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Serveurs de calcul</span>
                          <span className="font-mono text-emerald-400 font-bold">Paris (GCP FR)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Algorithme IRIS IA</span>
                          <span className="font-mono text-white font-bold">Actif v3.2</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Index de santé national</span>
                          <span className="font-mono text-[#FFC629] font-bold">68.4 / 100</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('securite')}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-jakarta font-bold transition-colors text-center"
                      >
                        Consulter le Journal de Sécurité →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Macro Baromètre National Tab */
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-jakarta font-bold text-[#123D46]">
                          Observatoire National du Lien Humain en Entreprise
                        </h2>
                        <p className="text-xs text-[#123D46]/70">
                          Agrégation en temps réel des 48 000+ évaluations IQRH sur le territoire français.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00A99D] bg-[#00A99D]/10 px-3 py-1.5 rounded-xl">
                        Mise à jour : En continu
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {[
                        { title: 'Confiance & Sécurité', score: 71.8, trend: '+1.4%' },
                        { title: 'Clarté des Échanges', score: 64.2, trend: '-0.3%' },
                        { title: 'Soutien & Entraide', score: 76.5, trend: '+2.1%' },
                        { title: 'Alignement Métiers', score: 62.0, trend: '+0.8%' },
                        { title: 'Capacité d’Action', score: 58.7, trend: '+3.5%' },
                      ].map((dim, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-[#E3EBE6] bg-[#F8F9FA]">
                          <div className="text-[11px] text-[#123D46]/60 font-medium">{dim.title}</div>
                          <div className="text-2xl font-jakarta font-black text-[#123D46] mt-2 font-mono">
                            {dim.score}
                          </div>
                          <div className="text-[11px] text-emerald-600 font-bold mt-1">
                            {dim.trend} vs M-1
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------- VIEW 2: DEMANDES DE DEVIS (Image 2) -------------------- */}
            {activeTab === 'devis' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#00A99D]/15 text-[#00A99D] flex items-center justify-center">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                        Demandes de Devis (Leads)
                      </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                      Gérez les prospects et convertissez-les en clients avec génération automatique de compte.
                    </p>
                  </div>

                  {/* Sub-tabs: En attente (N) vs Convertis (N) - Identique Image 2 */}
                  <div className="inline-flex p-1 bg-white border border-[#E3EBE6] rounded-xl shadow-2xs">
                    <button
                      onClick={() => setDevisSubTab('attente')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-jakarta font-bold transition-colors ${
                        devisSubTab === 'attente'
                          ? 'bg-[#00A99D]/15 text-[#00A99D]'
                          : 'text-[#123D46]/70 hover:text-[#123D46]'
                      }`}
                    >
                      En attente ({leads.filter(l => l.status !== 'Converti').length})
                    </button>
                    <button
                      onClick={() => setDevisSubTab('convertis')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-jakarta font-bold transition-colors ${
                        devisSubTab === 'convertis'
                          ? 'bg-[#00A99D]/15 text-[#00A99D]'
                          : 'text-[#123D46]/70 hover:text-[#123D46]'
                      }`}
                    >
                      Convertis ({leads.filter(l => l.status === 'Converti').length})
                    </button>
                  </div>
                </div>

                {/* Lead Table / List */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F9FA] border-b border-[#E3EBE6] text-[#123D46]/60 font-jakarta font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-6 py-4">Organisation & Contact</th>
                          <th className="px-6 py-4">Secteur</th>
                          <th className="px-6 py-4">Effectif</th>
                          <th className="px-6 py-4">Budget Estimé</th>
                          <th className="px-6 py-4">Date de Demande</th>
                          <th className="px-6 py-4">Statut</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBE6]/60 font-inter">
                        {leads
                          .filter(l => devisSubTab === 'convertis' ? l.status === 'Converti' : l.status !== 'Converti')
                          .map((lead) => (
                            <tr key={lead.id} className="hover:bg-[#F4F1E8]/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-jakarta font-bold text-sm text-[#123D46]">
                                  {lead.companyName}
                                </div>
                                <div className="text-[11px] text-[#123D46]/60">
                                  {lead.contactName} · <span className="font-mono">{lead.contactEmail}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded-md bg-[#123D46]/5 text-[#123D46] font-medium text-[11px]">
                                  {lead.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono font-medium">
                                {lead.estimatedUsers} pers.
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-[#00A99D]">
                                {lead.budgetEstimated}
                              </td>
                              <td className="px-6 py-4 text-[#123D46]/60">
                                {lead.requestedDate}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  lead.status === 'Converti'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : lead.status === 'En attente'
                                    ? 'bg-[#FFC629]/20 text-[#123D46]'
                                    : 'bg-[#5965E8]/10 text-[#5965E8]'
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {lead.status !== 'Converti' ? (
                                  <button
                                    onClick={() => handleConvertLead(lead.id)}
                                    className="px-3 py-1.5 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-colors shadow-2xs"
                                  >
                                    Convertir en Client
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setActiveTab('organisations')}
                                    className="px-3 py-1.5 rounded-xl border border-[#E3EBE6] text-[#123D46] hover:bg-[#F4F1E8] font-jakarta font-semibold text-xs transition-colors"
                                  >
                                    Voir Compte
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- VIEW 3: ORGANISATIONS (Image 3) -------------------- */}
            {activeTab === 'organisations' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                      Organisations (Partenaires)
                    </h1>
                    <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                      Gérez les Entreprises (B2B), Mutuelles (B2B2C) et Collectivités (B2G).
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search bar */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#123D46]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom ou code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-2 rounded-xl border border-[#E3EBE6] bg-white text-xs text-[#123D46] focus:outline-none focus:ring-1 focus:ring-[#00A99D] w-56"
                      />
                    </div>

                    {/* "+ Ajouter un partenaire" button (Exactement comme dans la capture 3) */}
                    <button
                      onClick={() => setIsAddPartnerOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-all shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un partenaire</span>
                    </button>
                  </div>
                </div>

                {/* Organisations Table (Fidèle à l'image 3) */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F9FA] border-b border-[#E3EBE6] text-[#123D46]/60 font-jakarta font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-6 py-4">NOM & CODE</th>
                          <th className="px-6 py-4">TYPE</th>
                          <th className="px-6 py-4">CONTACT ADMIN</th>
                          <th className="px-6 py-4">CAMPAGNES</th>
                          <th className="px-6 py-4">UTILISATEURS</th>
                          <th className="px-6 py-4">SCORE IQRH</th>
                          <th className="px-6 py-4 text-center">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBE6]/60 font-inter">
                        {organisations
                          .filter(org => org.name.toLowerCase().includes(searchQuery.toLowerCase()) || org.code.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((org) => (
                            <tr key={org.id} className="hover:bg-[#F4F1E8]/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-jakarta font-bold text-sm text-[#123D46]">
                                  {org.name}
                                </div>
                                <div className="text-[11px] font-mono font-semibold text-[#00A99D]">
                                  {org.code}
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  org.type.includes('Collectivités')
                                    ? 'bg-[#00A99D]/10 text-[#00A99D]'
                                    : org.type.includes('Mutuelles')
                                    ? 'bg-[#5965E8]/10 text-[#5965E8]'
                                    : 'bg-[#123D46]/10 text-[#123D46]'
                                }`}>
                                  {org.type}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <div className="font-medium text-[#123D46]">{org.adminContact.role}</div>
                                <div className="text-[11px] text-[#123D46]/60 font-mono">
                                  {org.adminContact.email}
                                </div>
                              </td>

                              <td className="px-6 py-4 font-mono font-bold text-[#123D46]">
                                {org.campaignsCount}
                              </td>

                              <td className="px-6 py-4 font-mono">
                                <div className="flex items-center gap-1.5 font-medium text-[#123D46]">
                                  <Users className="w-3.5 h-3.5 text-[#123D46]/50" />
                                  <span>{org.usersCount}</span>
                                </div>
                              </td>

                              <td className="px-6 py-4 font-mono font-bold text-[#00A99D]">
                                {org.iqrhScore} / 100
                              </td>

                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => setSelectedOrgDetails(org)}
                                  className="w-8 h-8 rounded-lg border border-[#E3EBE6] hover:border-[#00A99D] hover:bg-[#00A99D]/10 text-[#123D46] hover:text-[#00A99D] inline-flex items-center justify-center transition-colors"
                                  title="Détails du partenaire"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- VIEW 4: GESTION DES BINÔMES (Image 4) -------------------- */}
            {activeTab === 'binomes' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                    Gestion des Binômes
                  </h1>
                  <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                    Supervisez l’activité et l’état de santé des paires relationnelles.
                  </p>
                </div>

                {/* 4 Stats Cards Binômes (Image 4) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-4 relative overflow-hidden shadow-xs">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00A99D]" />
                    <div className="flex items-center justify-between text-[11px] font-jakarta font-bold text-[#123D46]/70">
                      <span>ACTIFS</span>
                      <TrendingUp className="w-3.5 h-3.5 text-[#00A99D]" />
                    </div>
                    <div className="text-2xl font-jakarta font-black text-[#123D46] mt-2 font-mono">
                      {binomes.filter(b => b.status === 'Actif').length}
                    </div>
                  </div>

                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-4 relative overflow-hidden shadow-xs">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFC629]" />
                    <div className="flex items-center justify-between text-[11px] font-jakarta font-bold text-[#123D46]/70">
                      <span>EN ÉVALUATION</span>
                      <Clock className="w-3.5 h-3.5 text-[#FFC629]" />
                    </div>
                    <div className="text-2xl font-jakarta font-black text-[#123D46] mt-2 font-mono">
                      {binomes.filter(b => b.status === 'En évaluation').length}
                    </div>
                  </div>

                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-4 relative overflow-hidden shadow-xs">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    <div className="flex items-center justify-between text-[11px] font-jakarta font-bold text-[#123D46]/70">
                      <span>TERMINÉS</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-jakarta font-black text-[#123D46] mt-2 font-mono">
                      0
                    </div>
                  </div>

                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-4 relative overflow-hidden shadow-xs">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5965E8]" />
                    <div className="flex items-center justify-between text-[11px] font-jakarta font-bold text-[#123D46]/70">
                      <span>TOTAL</span>
                      <Users className="w-3.5 h-3.5 text-[#5965E8]" />
                    </div>
                    <div className="text-2xl font-jakarta font-black text-[#123D46] mt-2 font-mono">
                      {binomes.length}
                    </div>
                  </div>
                </div>

                {/* Binômes Table */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F9FA] border-b border-[#E3EBE6] text-[#123D46]/60 font-jakarta font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-6 py-4">UTILISATEURS (BINÔME)</th>
                          <th className="px-6 py-4">ORGANISATION</th>
                          <th className="px-6 py-4">STATUT</th>
                          <th className="px-6 py-4">SANTÉ (SCORE)</th>
                          <th className="px-6 py-4">DÉBUT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBE6]/60 font-inter">
                        {binomes.map((bin) => (
                          <tr key={bin.id} className="hover:bg-[#F4F1E8]/30 transition-colors">
                            <td className="px-6 py-4 font-jakarta font-bold text-sm text-[#123D46]">
                              {bin.pairName}
                            </td>
                            <td className="px-6 py-4 text-[#123D46]/70">
                              {bin.orgName}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                bin.status === 'Actif'
                                  ? 'bg-[#00A99D]/15 text-[#00A99D]'
                                  : 'bg-[#FFC629]/20 text-[#123D46]'
                              }`}>
                                {bin.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-[#00A99D]">
                              {bin.healthScore} / 100
                            </td>
                            <td className="px-6 py-4 text-[#123D46]/60">
                              {bin.startDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- VIEW 5: CATALOGUE CENTRAL (Image 5) -------------------- */}
            {activeTab === 'catalogues' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                      Catalogue Central
                    </h1>
                    <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                      Gérez les recommandations, les micro-défis et la liste des partenaires.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Importer JSON (Dark Button from screenshot 5) */}
                    <button
                      onClick={() => alert("Fonctionnalité d'import JSON activée : format standardisé LINK OFFICE")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#123D46] hover:bg-[#0D2530] text-white font-jakarta font-bold text-xs transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Importer le catalogue (JSON)</span>
                    </button>

                    {/* Ajouter un élément (Teal Button from screenshot 5) */}
                    <button
                      onClick={() => setIsAddCatalogOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-colors shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un élément</span>
                    </button>
                  </div>
                </div>

                {/* Sub-tabs: Tout voir, Recommandations, Micro-défis, Partenaires, Questions IQRH, Modules Adaptatifs (Screenshot 5) */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                  {[
                    'Tout voir',
                    'Recommandations',
                    'Micro-défis',
                    'Partenaires',
                    'Questions IQRH',
                    'Modules Adaptatifs'
                  ].map((filterTab) => (
                    <button
                      key={filterTab}
                      onClick={() => setCatalogSubTab(filterTab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-jakarta font-semibold transition-colors whitespace-nowrap ${
                        catalogSubTab === filterTab
                          ? 'bg-[#00A99D]/15 text-[#00A99D] ring-1 ring-[#00A99D]/30'
                          : 'bg-white border border-[#E3EBE6] text-[#123D46]/70 hover:text-[#123D46]'
                      }`}
                    >
                      {filterTab}
                    </button>
                  ))}
                </div>

                {/* Catalog Table (Screenshot 5) */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F9FA] border-b border-[#E3EBE6] text-[#123D46]/60 font-jakarta font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-6 py-4">TITRE & TYPE</th>
                          <th className="px-6 py-4">THÈMES</th>
                          <th className="px-6 py-4">CIBLAGE & DIFFICULTÉ</th>
                          <th className="px-6 py-4 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBE6]/60 font-inter">
                        {catalogItems
                          .filter(item => catalogSubTab === 'Tout voir' ? true : item.type === catalogSubTab)
                          .map((item) => (
                            <tr key={item.id} className="hover:bg-[#F4F1E8]/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="text-[10px] font-mono text-[#123D46]/60">
                                  {item.code}
                                </div>
                                <div className="font-jakarta font-bold text-sm text-[#123D46]">
                                  {item.title}
                                </div>
                                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-[#00A99D]/10 text-[#00A99D] font-bold">
                                  {item.type}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-[#123D46] font-medium">
                                {item.theme}
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-[#123D46]">{item.targetCategory}</span>
                                  <span className="text-[11px] font-mono font-bold text-[#5965E8] bg-[#5965E8]/10 px-2 py-0.5 rounded">
                                    💎 {item.points} pts
                                  </span>
                                  <span className="text-[11px] font-medium text-[#123D46]/70 bg-[#123D46]/5 px-2 py-0.5 rounded">
                                    ⏳ {item.difficulty}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-right space-x-1.5">
                                <button
                                  onClick={() => alert(`Édition de l'élément ${item.code}`)}
                                  className="w-8 h-8 rounded-lg bg-[#123D46]/5 hover:bg-[#123D46]/10 text-[#123D46] inline-flex items-center justify-center transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCatalogItem(item.id)}
                                  className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- VIEW 6: MÉDIATHÈQUE (CMS) (Image 6) -------------------- */}
            {activeTab === 'medias' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                      Médiathèque (CMS)
                    </h1>
                    <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                      Gérez les articles, podcasts et autres contenus publics.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddMediaOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouveau Contenu</span>
                  </button>
                </div>

                {/* Media CMS Table */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F9FA] border-b border-[#E3EBE6] text-[#123D46]/60 font-jakarta font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-6 py-4">TITRE</th>
                          <th className="px-6 py-4">TYPE</th>
                          <th className="px-6 py-4">STATUT</th>
                          <th className="px-6 py-4">LECTURES / ÉCOUTES</th>
                          <th className="px-6 py-4">DATE</th>
                          <th className="px-6 py-4 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBE6]/60 font-inter">
                        {medias.map((med) => (
                          <tr key={med.id} className="hover:bg-[#F4F1E8]/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-jakarta font-bold text-sm text-[#123D46]">
                                {med.title}
                              </div>
                              <div className="text-[11px] text-[#123D46]/60">
                                Auteur : {med.author} · {med.category}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-md bg-[#123D46]/5 text-[#123D46] font-medium text-[11px]">
                                {med.type}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {med.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 font-mono font-medium text-[#123D46]">
                              {med.reads.toLocaleString('fr-FR')}
                            </td>

                            <td className="px-6 py-4 text-[#123D46]/60">
                              {med.date}
                            </td>

                            <td className="px-6 py-4 text-right space-x-1.5">
                              <button
                                onClick={() => alert(`Édition média : ${med.title}`)}
                                className="w-8 h-8 rounded-lg bg-[#123D46]/5 hover:bg-[#123D46]/10 text-[#123D46] inline-flex items-center justify-center transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- VIEW 7: FINANCES (Modules Additionnels de la Charte) -------------------- */}
            {activeTab === 'finances' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                    Finances & Facturation B2B
                  </h1>
                  <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                    Suivi des souscriptions annuelles, licences par collaborateur et factures acquittées.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-white border border-[#E3EBE6] space-y-2">
                    <span className="text-[11px] font-jakarta font-bold text-[#00A99D] uppercase tracking-wider">
                      MRR (REVENU RÉCURRENT MENSUEL)
                    </span>
                    <div className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                      18 450 €
                    </div>
                    <span className="text-xs text-emerald-600 font-bold">+14% vs trimestre précédent</span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-[#E3EBE6] space-y-2">
                    <span className="text-[11px] font-jakarta font-bold text-[#5965E8] uppercase tracking-wider">
                      VALEUR MOYENNE PAR CONTRAT (ACV)
                    </span>
                    <div className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                      12 800 € / an
                    </div>
                    <span className="text-xs text-[#123D46]/60">Engagement moyen : 24 mois</span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-[#E3EBE6] space-y-2">
                    <span className="text-[11px] font-jakarta font-bold text-[#FFC629] uppercase tracking-wider">
                      FACTURES EN ATTENTE
                    </span>
                    <div className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                      0 €
                    </div>
                    <span className="text-xs text-[#00A99D] font-bold">100% à jour</span>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- VIEW 8: UTILISATEURS (RGPD & ANONYMISATION) -------------------- */}
            {activeTab === 'utilisateurs' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                    Annuaire Utilisateurs & Respect de l’Anonymat
                  </h1>
                  <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                    Gestion des comptes administrateurs, référents RH et salariés sous pseudonymat cryptographique.
                  </p>
                </div>

                <div className="bg-[#00A99D]/5 border border-[#00A99D]/20 rounded-2xl p-5 flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-[#00A99D] shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-[#123D46]">
                    <div className="font-bold">Protocole de protection des données individuelles (RGPD)</div>
                    <p className="text-[#123D46]/80 leading-relaxed">
                      Conformément à la charte déontologique de LINK OFFICE, les réponses aux évaluations IQRH sont séparées de l’identité des salariés via un hachage unidirectionnel (SHA-256 avec sel dynamique). Les managers et la gouvernance n’ont accès qu’aux agrégats statistiques.
                    </p>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F9FA] border-b border-[#E3EBE6] text-[#123D46]/60 font-jakarta font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4">IDENTIFIANT OU PSEUDONYME</th>
                        <th className="px-6 py-4">ORGANISATION</th>
                        <th className="px-6 py-4">RÔLE</th>
                        <th className="px-6 py-4">DERNIÈRE ACTIVITÉ</th>
                        <th className="px-6 py-4">STATUT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE6]/60">
                      {[
                        { id: 'USR-8921-ANON', org: 'Acme Corp (B2B)', role: 'Salarié (Anonymisé)', last: 'Aujourd’hui 11:20', status: 'Actif' },
                        { id: 'RH-ACME-01', org: 'Acme Corp (B2B)', role: 'Gestionnaire RH', last: 'Hier 15:40', status: 'Actif' },
                        { id: 'MUTU-SOLIS-ADMIN', org: 'Mutuelle Solis (B2B2C)', role: 'Référent Prévention', last: '28/09/2026', status: 'Actif' },
                        { id: 'USR-3419-ANON', org: 'Ville de Testville', role: 'Agent Collectivité (Anonymisé)', last: '25/09/2026', status: 'Actif' },
                      ].map((u, i) => (
                        <tr key={i} className="hover:bg-[#F4F1E8]/30">
                          <td className="px-6 py-4 font-mono font-bold text-[#123D46]">{u.id}</td>
                          <td className="px-6 py-4 text-[#123D46]/80">{u.org}</td>
                          <td className="px-6 py-4 font-medium">{u.role}</td>
                          <td className="px-6 py-4 text-[#123D46]/60">{u.last}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* -------------------- VIEW 9: SÉCURITÉ & AUDIT -------------------- */}
            {activeTab === 'securite' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                    Sécurité, Clés API & Audit Logs
                  </h1>
                  <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                    Supervision cryptographique, intégrité des données et traçabilité des opérations sensibles.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card: Audit Logs */}
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-4">
                    <h2 className="font-jakarta font-bold text-sm text-[#123D46] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#00A99D]" />
                      <span>Derniers Événements d’Audit Système</span>
                    </h2>
                    <div className="divide-y divide-[#E3EBE6]/60 text-xs">
                      <div className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#123D46]">Re-calcul automatique de l’Indice National</div>
                          <div className="text-[11px] text-[#123D46]/60">Trigger périodique cron (Laboratoire)</div>
                        </div>
                        <span className="font-mono text-[10px] text-[#123D46]/50">14:02:10</span>
                      </div>
                      <div className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#123D46]">Exportation rapport Acme Corp</div>
                          <div className="text-[11px] text-[#123D46]/60">Par Super Admin Camille</div>
                        </div>
                        <span className="font-mono text-[10px] text-[#123D46]/50">Hier 18:30</span>
                      </div>
                      <div className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#123D46]">Chiffrement AES-256 renouvelé</div>
                          <div className="text-[11px] text-[#123D46]/60">Rotations de clés de partitionnement</div>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-600 font-bold">Succès</span>
                      </div>
                    </div>
                  </div>

                  {/* Card: Security Checkup */}
                  <div className="bg-[#123D46] text-white rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-jakarta font-bold text-[#FFC629] uppercase tracking-wider">
                          SCORE DE SÉCURITÉ GOUVERNANCE
                        </span>
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-4xl font-jakarta font-black text-white font-mono">
                        99.8 <span className="text-sm font-normal text-white/60">/ 100</span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Conformité ISO 27001 / RGPD vérifiée. Aucun incident de fuite ou de corrélation de données détecté sur les 12 derniers mois.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-white/60">Chiffrement en transit & au repos</span>
                      <span className="text-emerald-400 font-bold font-mono">TLS 1.3 / AES-GCM</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ==================== 4. MODALS ==================== */}

      {/* Modal 1: Ajouter un Partenaire */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 bg-[#123D46]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3EBE6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#00A99D]" />
                <h3 className="font-jakarta font-bold text-lg text-[#123D46]">
                  Ajouter une Nouvelle Organisation
                </h3>
              </div>
              <button
                onClick={() => setIsAddPartnerOpen(false)}
                className="p-1 rounded-lg text-[#123D46]/50 hover:bg-[#F4F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[#123D46] mb-1">Nom de l'organisation *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Nexity France, CHU de Bordeaux, Région Sud"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#123D46] mb-1">Code organisation</label>
                  <input
                    type="text"
                    placeholder="Ex : NEXI-2026-TEST"
                    value={newOrgCode}
                    onChange={(e) => setNewOrgCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#123D46] mb-1">Type de structure</label>
                  <select
                    value={newOrgType}
                    onChange={(e) => setNewOrgType(e.target.value as PartnerType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                  >
                    <option value="Entreprises (B2B)">Entreprises (B2B)</option>
                    <option value="Mutuelles (B2B2C)">Mutuelles (B2B2C)</option>
                    <option value="Collectivités (B2G)">Collectivités (B2G)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#123D46] mb-1">Email Référent RH</label>
                  <input
                    type="email"
                    placeholder="drh@organisation.fr"
                    value={newOrgEmail}
                    onChange={(e) => setNewOrgEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#123D46] mb-1">Nombre d'utilisateurs</label>
                  <input
                    type="number"
                    value={newOrgUsers}
                    onChange={(e) => setNewOrgUsers(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E3EBE6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3EBE6] text-[#123D46] hover:bg-[#F4F1E8]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold shadow-xs"
                >
                  Créer et Provisionner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Ajouter un Élément au Catalogue */}
      {isAddCatalogOpen && (
        <div className="fixed inset-0 z-50 bg-[#123D46]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3EBE6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#00A99D]" />
                <h3 className="font-jakarta font-bold text-lg text-[#123D46]">
                  Ajouter un Élément au Catalogue
                </h3>
              </div>
              <button
                onClick={() => setIsAddCatalogOpen(false)}
                className="p-1 rounded-lg text-[#123D46]/50 hover:bg-[#F4F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCatalogItem} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[#123D46] mb-1">Titre de l'action / défi *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Poser une question ouverte avant de réagir"
                  value={newCatalogTitle}
                  onChange={(e) => setNewCatalogTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#123D46] mb-1">Type d'élément</label>
                  <select
                    value={newCatalogType}
                    onChange={(e) => setNewCatalogType(e.target.value as CatalogItem['type'])}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                  >
                    <option value="Micro-défis">Micro-défis</option>
                    <option value="Recommandations">Recommandations</option>
                    <option value="Questions IQRH">Questions IQRH</option>
                    <option value="Modules Adaptatifs">Modules Adaptatifs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#123D46] mb-1">Thème relationnel</label>
                  <input
                    type="text"
                    value={newCatalogTheme}
                    onChange={(e) => setNewCatalogTheme(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#123D46] mb-1">Points diamant</label>
                  <input
                    type="number"
                    value={newCatalogPoints}
                    onChange={(e) => setNewCatalogPoints(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#123D46] mb-1">Niveau de difficulté</label>
                  <select
                    value={newCatalogDifficulty}
                    onChange={(e) => setNewCatalogDifficulty(e.target.value as CatalogItem['difficulty'])}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                  >
                    <option value="Facile">Facile</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Avancée">Avancée</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E3EBE6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCatalogOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3EBE6] text-[#123D46] hover:bg-[#F4F1E8]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold shadow-xs"
                >
                  Enregistrer l'élément
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Détails d'une Organisation (Drawer / Popover) */}
      {selectedOrgDetails && (
        <div className="fixed inset-0 z-50 bg-[#123D46]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3EBE6] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
              <div>
                <h3 className="font-jakarta font-bold text-lg text-[#123D46]">
                  {selectedOrgDetails.name}
                </h3>
                <span className="text-xs font-mono font-bold text-[#00A99D]">
                  {selectedOrgDetails.code}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrgDetails(null)}
                className="p-1 rounded-lg text-[#123D46]/50 hover:bg-[#F4F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E3EBE6]">
                  <span className="text-[10px] text-[#123D46]/60 block">Statut du déploiement</span>
                  <span className="font-bold text-emerald-700 text-sm mt-0.5 block">{selectedOrgDetails.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E3EBE6]">
                  <span className="text-[10px] text-[#123D46]/60 block">Score Moyen IQRH</span>
                  <span className="font-bold text-[#00A99D] font-mono text-sm mt-0.5 block">{selectedOrgDetails.iqrhScore} / 100</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#E3EBE6] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#123D46]/60">Contact Administrateur :</span>
                  <span className="font-medium text-[#123D46]">{selectedOrgDetails.adminContact.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#123D46]/60">Email Référent :</span>
                  <span className="font-mono text-[#123D46]">{selectedOrgDetails.adminContact.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#123D46]/60">Taux de participation :</span>
                  <span className="font-bold text-[#00A99D]">{selectedOrgDetails.activeRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#123D46]/60">Échéance renouvellement :</span>
                  <span className="text-[#123D46]">{selectedOrgDetails.renewalDate}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedOrgDetails(null);
                    setTopMode('partenaires');
                  }}
                  className="text-xs font-jakarta font-bold text-[#00A99D] hover:underline"
                >
                  Ouvrir la vue portail partenaire →
                </button>
                <button
                  onClick={() => setSelectedOrgDetails(null)}
                  className="px-4 py-2 rounded-xl bg-[#123D46] text-white font-jakarta font-semibold text-xs"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
