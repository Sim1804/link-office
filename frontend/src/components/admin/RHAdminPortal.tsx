import React, { useState } from 'react';
import { Logo } from '../brand/Logo';
import { ToastContainer, ToastMessage } from '../common/Toast';
import {
  Bell,
  ChevronDown,
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  Award,
  Sparkles,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Home,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  Layers,
  HeartHandshake,
  LogOut,
  X,
  Target,
  Download,
  Mail,
  PieChart
} from 'lucide-react';

interface RHAdminPortalProps {
  onReturnToPublic: () => void;
  onSwitchToEmployeeDemo?: () => void;
  onSwitchToSuperAdmin?: () => void;
}

export const RHAdminPortal: React.FC<RHAdminPortalProps> = ({
  onReturnToPublic,
  onSwitchToEmployeeDemo,
  onSwitchToSuperAdmin
}) => {
  // Main Navigation Tabs: 'observatoire' | 'campagnes' | 'collectifs' | 'rapports'
  const [activeTab, setActiveTab] = useState<'observatoire' | 'campagnes' | 'collectifs' | 'rapports'>('observatoire');

  // Sub-tabs in Observatoire (from screenshots 1, 2, 3)
  const [subTab, setSubTab] = useState<'generale' | 'tendances' | 'recommandations'>('generale');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Filter dropdown states
  const [selectedCampaign, setSelectedCampaign] = useState('Campagne QVT Acme 2026');
  const [selectedAge, setSelectedAge] = useState('Tous âges');
  const [selectedGender, setSelectedGender] = useState('Tous genres');

  // Modals & Popovers
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showActionPlanModal, setShowActionPlanModal] = useState(false);

  // New Campaign Form State
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignStartDate, setNewCampaignStartDate] = useState('2026-10-15');
  const [newCampaignEndDate, setNewCampaignEndDate] = useState('2026-11-15');
  const [newCampaignTarget, setNewCampaignTarget] = useState('Tous les collaborateurs');

  // Partner mode: B2B (Entreprise), B2B2C (Mutuelle), B2G (Collectivité) - The navbar & portal are the same!
  const [partnerMode, setPartnerMode] = useState<'b2b' | 'b2b2c' | 'b2g'>('b2b');

  // Interactive campaigns list
  const [campaigns, setCampaigns] = useState([
    {
      id: 'cmp-1',
      title: 'Campagne QVT Acme 2026',
      isPremium: true,
      isActive: true,
      invitedCount: 15,
      completedCount: 12,
      rate: 80,
      startDate: '29/09/2026',
      endDate: '29/10/2026',
      daysRemaining: 27,
      targetDepartment: 'Siège & Pôles Opérationnels'
    }
  ]);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle) return;
    const newCamp = {
      id: `cmp-${Date.now()}`,
      title: newCampaignTitle,
      isPremium: true,
      isActive: true,
      invitedCount: 20,
      completedCount: 0,
      rate: 0,
      startDate: newCampaignStartDate.split('-').reverse().join('/'),
      endDate: newCampaignEndDate.split('-').reverse().join('/'),
      daysRemaining: 30,
      targetDepartment: newCampaignTarget
    };
    setCampaigns([newCamp, ...campaigns]);
    setShowNewCampaignModal(false);
    setNewCampaignTitle('');
    addToast('Campagne créée', 'Nouvelle campagne lancée avec invitations anonymisées sécurisées !', 'success');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#123D46] font-inter flex flex-col selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      {/* ==================== 1. TOP NAVBAR SPÉCIFIQUE ADMIN B2B / B2B2C / B2G ==================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-4 sm:px-8 py-3 shadow-2xs">
        <div className="max-w-[1480px] mx-auto flex items-center justify-between">
          {/* Zone 1: Logo LINK OFFICE + Org Type indicator */}
          <div className="flex items-center gap-3">
            <div onClick={onReturnToPublic} className="cursor-pointer hover:opacity-90 transition-opacity">
              <Logo size="sm" showTagline={false} />
            </div>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#E3EBE6]">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00A99D]/10 text-[#00A99D] text-xs font-jakarta font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>
                  {partnerMode === 'b2b'
                    ? 'Acme Corp (B2B)'
                    : partnerMode === 'b2b2c'
                    ? 'Mutuelle Solis (B2B2C)'
                    : 'Ville de Testville (B2G)'}
                </span>
              </span>
              <span className="text-[11px] text-[#123D46]/60 font-medium">
                · Socle unifié Partenaires
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Principale (Observatoire | Campagnes | Collaborateurs/Adhérents | Rapports) */}
          <nav className="flex items-center gap-5 sm:gap-8 font-jakarta text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('observatoire')}
              className={`relative py-2 transition-colors ${
                activeTab === 'observatoire'
                  ? 'text-[#00A99D] font-bold'
                  : 'text-[#123D46]/65 hover:text-[#123D46]'
              }`}
            >
              <span>Observatoire</span>
              {activeTab === 'observatoire' && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00A99D] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('campagnes')}
              className={`relative py-2 transition-colors ${
                activeTab === 'campagnes'
                  ? 'text-[#00A99D] font-bold'
                  : 'text-[#123D46]/65 hover:text-[#123D46]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>Campagnes</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              {activeTab === 'campagnes' && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00A99D] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('collectifs')}
              className={`relative py-2 transition-colors ${
                activeTab === 'collectifs'
                  ? 'text-[#00A99D] font-bold'
                  : 'text-[#123D46]/65 hover:text-[#123D46]'
              }`}
            >
              <span>
                {partnerMode === 'b2b'
                  ? 'Collaborateurs'
                  : partnerMode === 'b2b2c'
                  ? 'Adhérents'
                  : 'Agents'}
              </span>
              {activeTab === 'collectifs' && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00A99D] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('rapports')}
              className={`relative py-2 transition-colors ${
                activeTab === 'rapports'
                  ? 'text-[#00A99D] font-bold'
                  : 'text-[#123D46]/65 hover:text-[#123D46]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>Rapports</span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-[#123D46]/5 text-[#123D46]/70">
                  CSE
                </span>
              </div>
              {activeTab === 'rapports' && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00A99D] rounded-full" />
              )}
            </button>
          </nav>

          {/* Zone 3: RGPD Badge, Notifications & Profile Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* RGPD Safe Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-medium" title="Garantie stricte de confidentialité RGPD">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>k-anonymat ≥ 5</span>
            </div>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70 transition-colors relative"
                aria-label="Notifications RH"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00A99D] ring-2 ring-white" />
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E3EBE6] rounded-2xl shadow-xl p-4 z-50 animate-scale-in text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3EBE6]">
                    <span className="font-jakarta font-bold text-[#123D46]">Alertes Organisation</span>
                    <span className="text-[10px] font-bold text-[#00A99D] bg-[#00A99D]/10 px-2 py-0.5 rounded-full">
                      Campagne Active
                    </span>
                  </div>
                  <div className="divide-y divide-[#E3EBE6]/60 mt-2 max-h-60 overflow-y-auto space-y-2">
                    <div className="pt-2 text-[#123D46]">
                      <div className="flex items-center gap-1.5 font-bold text-[#00A99D]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Seuil k-anonymat validé</span>
                      </div>
                      <p className="text-[11px] text-[#123D46]/70 mt-0.5">
                        12 réponses reçues sur la campagne QVT 2026. Les analyses croisées sont débloquées.
                      </p>
                      <span className="text-[10px] text-[#123D46]/40">Hier à 17:15</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Badge (Exactement comme dans les 4 captures : R / RH Admin B2B / Administrateur B2B) */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E3EBE6] bg-white hover:bg-[#F4F1E8]/50 transition-colors shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#00A99D] text-white font-jakarta font-bold text-xs flex items-center justify-center">
                  R
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-xs font-jakarta font-bold text-[#123D46]">
                    {partnerMode === 'b2b' ? 'RH Admin B2B' : partnerMode === 'b2b2c' ? 'Admin Mutuelle' : 'Admin Collectivité'}
                  </div>
                  <div className="text-[10px] text-[#00A99D] font-medium">
                    {partnerMode === 'b2b' ? 'Administrateur B2B' : partnerMode === 'b2b2c' ? 'Administrateur B2B2C' : 'Administrateur B2G'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#123D46]/50 ml-1" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E3EBE6] rounded-2xl shadow-xl p-3 z-50 animate-scale-in text-xs space-y-2">
                  <div className="px-3 py-2 border-b border-[#E3EBE6]">
                    <div className="font-bold text-[#123D46]">
                      {partnerMode === 'b2b' ? 'Sophie Laurent (DRH)' : partnerMode === 'b2b2c' ? 'Marc Levêque (Prévention)' : 'Émilie Renaud (DGS)'}
                    </div>
                    <div className="text-[11px] text-[#123D46]/60">
                      {partnerMode === 'b2b' ? 'admin.b2b@linkoffice.fr' : partnerMode === 'b2b2c' ? 'admin.b2b2c@linkoffice.fr' : 'dgs@ville-testville.fr'}
                    </div>
                    <div className="mt-1 text-[10px] text-[#00A99D] font-bold">
                      {partnerMode === 'b2b' ? 'Entreprise Acme Corp (B2B)' : partnerMode === 'b2b2c' ? 'Mutuelle Solis (B2B2C)' : 'Ville de Testville (B2G)'}
                    </div>
                  </div>

                  {/* Switcher B2B / B2B2C / B2G to show they use the exact same navbar & portal */}
                  <div className="px-3 py-1 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
                    <span className="text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider block mb-1">
                      Type d'Organisation Partenaire
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => setPartnerMode('b2b')}
                        className={`py-1 rounded text-[10px] font-bold transition-all ${
                          partnerMode === 'b2b' ? 'bg-[#00A99D] text-white' : 'text-[#123D46]/70 hover:bg-white'
                        }`}
                      >
                        B2B
                      </button>
                      <button
                        onClick={() => setPartnerMode('b2b2c')}
                        className={`py-1 rounded text-[10px] font-bold transition-all ${
                          partnerMode === 'b2b2c' ? 'bg-[#00A99D] text-white' : 'text-[#123D46]/70 hover:bg-white'
                        }`}
                      >
                        B2B2C
                      </button>
                      <button
                        onClick={() => setPartnerMode('b2g')}
                        className={`py-1 rounded text-[10px] font-bold transition-all ${
                          partnerMode === 'b2g' ? 'bg-[#00A99D] text-white' : 'text-[#123D46]/70 hover:bg-white'
                        }`}
                      >
                        B2G
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[#E3EBE6] pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onReturnToPublic();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Quitter l'espace organisation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================== 2. CONTENU PRINCIPAL DU PORTAIL RH ==================== */}
      <main className="flex-1 max-w-[1480px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">

        {/* ========================================================================= */}
        {/* TAB 1: OBSERVATOIRE DE LA QUALITÉ RELATIONNELLE (Images 1, 2, 3)          */}
        {/* ========================================================================= */}
        {activeTab === 'observatoire' && (
          <div className="space-y-6">
            {/* Header section: Title, Subtitle, and Cohort Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight">
                  Observatoire de la Qualité Relationnelle
                </h1>
                <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                  Analysez l'écosystème relationnel de vos collaborateurs et identifiez les leviers d'action.
                </p>
              </div>

              {/* 3 Dropdown Filters + Secondary Actions (Screenshot 1, 2, 3: Toutes les campagnes, Tous âges, Tous genres / Gérer les campagnes, Plan d'action) */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="text-xs font-jakarta font-semibold bg-white border border-[#E3EBE6] rounded-xl px-3 py-2 text-[#123D46] shadow-2xs hover:border-[#00A99D] focus:outline-none"
                  >
                    <option value="Campagne QVT Acme 2026">Toutes les campagnes</option>
                    <option value="Campagne QVT Acme 2026">Campagne QVT Acme 2026</option>
                    <option value="Diagnostic Hiver">Diagnostic Hiver (Archive)</option>
                  </select>

                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="text-xs font-jakarta font-semibold bg-white border border-[#E3EBE6] rounded-xl px-3 py-2 text-[#123D46] shadow-2xs hover:border-[#00A99D] focus:outline-none"
                  >
                    <option value="Tous âges">Tous âges</option>
                    <option value="< 30 ans">&lt; 30 ans</option>
                    <option value="30-45 ans">30 - 45 ans</option>
                    <option value="> 45 ans">&gt; 45 ans</option>
                  </select>

                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="text-xs font-jakarta font-semibold bg-white border border-[#E3EBE6] rounded-xl px-3 py-2 text-[#123D46] shadow-2xs hover:border-[#00A99D] focus:outline-none"
                  >
                    <option value="Tous genres">Tous genres</option>
                    <option value="Femmes">Femmes</option>
                    <option value="Hommes">Hommes</option>
                    <option value="Non spécifié">Non spécifié</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 text-xs font-jakarta font-semibold">
                  <button
                    onClick={() => setActiveTab('campagnes')}
                    className="text-[#123D46]/75 hover:text-[#00A99D] transition-colors"
                  >
                    Gérer les campagnes
                  </button>
                  <button
                    onClick={() => setShowActionPlanModal(true)}
                    className="text-[#00A99D] hover:underline transition-colors font-bold"
                  >
                    Plan d'action
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-tabs row (Screenshot 1, 2, 3): Vue Générale | Tendances & Profils | Recommandations & Leviers */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => setSubTab('generale')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta transition-all whitespace-nowrap ${
                  subTab === 'generale'
                    ? 'bg-[#00A99D]/12 text-[#00A99D] ring-1 ring-[#00A99D]/30 font-bold shadow-2xs'
                    : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70 font-semibold'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Vue Générale</span>
              </button>

              <button
                onClick={() => setSubTab('tendances')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta transition-all whitespace-nowrap ${
                  subTab === 'tendances'
                    ? 'bg-[#00A99D]/12 text-[#00A99D] ring-1 ring-[#00A99D]/30 font-bold shadow-2xs'
                    : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70 font-semibold'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Tendances & Profils</span>
              </button>

              <button
                onClick={() => setSubTab('recommandations')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-jakarta transition-all whitespace-nowrap ${
                  subTab === 'recommandations'
                    ? 'bg-[#00A99D]/12 text-[#00A99D] ring-1 ring-[#00A99D]/30 font-bold shadow-2xs'
                    : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70 font-semibold'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Recommandations & Leviers</span>
              </button>
            </div>

            {/* ================= 4 KPI CARDS COMMUNE AUX 3 SOUS-VUES ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: IQRH MOYEN 67/100 */}
              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider block">
                    IQRH MOYEN
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                      67
                    </span>
                    <span className="text-xs text-[#123D46]/50 font-medium">/ 100</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    +3.2 pts vs moyenne secteur
                  </span>
                </div>
              </div>

              {/* Card 2: COLLABORATEURS ÉVALUÉS 12 */}
              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider block">
                    COLLABORATEURS ÉVALUÉS
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                      12
                    </span>
                    <span className="text-xs text-[#123D46]/50 font-medium">/ 15 invités</span>
                  </div>
                  <span className="text-[10px] text-[#5965E8] font-bold">
                    Taux de complétion 80%
                  </span>
                </div>
              </div>

              {/* Card 3: POINT FORT Sentimental 69/100 */}
              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-jakarta font-bold text-emerald-700 uppercase tracking-wider block">
                    POINT FORT
                  </span>
                  <div className="text-lg font-jakarta font-extrabold text-[#123D46] mt-0.5">
                    Sentimental & Entraide
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>69 / 100</span>
                  </div>
                </div>
              </div>

              {/* Card 4: FRAGILITÉ Affectif 61/100 */}
              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-jakarta font-bold text-rose-700 uppercase tracking-wider block">
                    FRAGILITÉ
                  </span>
                  <div className="text-lg font-jakarta font-extrabold text-[#123D46] mt-0.5">
                    Affectif & Régulation
                  </div>
                  <div className="text-xs font-mono font-bold text-rose-600 flex items-center gap-1">
                    <span>↘ 61 / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= SOUS-VUE A: VUE GÉNÉRALE (Image 1) ================= */}
            {subTab === 'generale' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Radar Chart d'Équipe (Équilibre) */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
                    <div>
                      <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                        Équilibre Relationnel Global (Radar d'Équipe)
                      </h3>
                      <p className="text-xs text-[#123D46]/60">
                        Polygone d’équilibre calculé sur les 5 dimensions fondamentales
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#00A99D]/10 text-[#00A99D]">
                      Cohorte Acme
                    </span>
                  </div>

                  {/* SVG Radar Display */}
                  <div className="flex flex-col items-center justify-center py-4">
                    <svg viewBox="0 0 340 320" className="w-full max-w-[320px] overflow-visible">
                      {/* Concentric pentagons */}
                      {[0.25, 0.5, 0.75, 1.0].map((level, i) => {
                        const r = 100 * level;
                        const points = [0, 1, 2, 3, 4]
                          .map((a) => {
                            const angle = (a * 2 * Math.PI) / 5 - Math.PI / 2;
                            return `${170 + r * Math.cos(angle)},${160 + r * Math.sin(angle)}`;
                          })
                          .join(' ');
                        return (
                          <polygon
                            key={i}
                            points={points}
                            fill={i === 3 ? '#F8F9FA' : 'none'}
                            stroke="#E3EBE6"
                            strokeWidth="1.2"
                            strokeDasharray={i < 3 ? '2 2' : 'none'}
                          />
                        );
                      })}

                      {/* Axes */}
                      {[0, 1, 2, 3, 4].map((a) => {
                        const angle = (a * 2 * Math.PI) / 5 - Math.PI / 2;
                        return (
                          <line
                            key={a}
                            x1="170"
                            y1="160"
                            x2={170 + 100 * Math.cos(angle)}
                            y2={160 + 100 * Math.sin(angle)}
                            stroke="#E3EBE6"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Team Score Polygon (Acme Corp Values) */}
                      {/* Dimensions: 0: Relations sociales (75), 1: Relations affectives (61), 2: Relation à soi (72), 3: Dynamique pro (68), 4: Sens & Projet (69) */}
                      {(() => {
                        const scores = [0.75, 0.61, 0.72, 0.68, 0.69];
                        const points = scores
                          .map((sc, a) => {
                            const angle = (a * 2 * Math.PI) / 5 - Math.PI / 2;
                            const r = 100 * sc;
                            return `${170 + r * Math.cos(angle)},${160 + r * Math.sin(angle)}`;
                          })
                          .join(' ');
                        return (
                          <>
                            <polygon
                              points={points}
                              fill="rgba(0, 169, 157, 0.22)"
                              stroke="#00A99D"
                              strokeWidth="2.5"
                            />
                            {scores.map((sc, a) => {
                              const angle = (a * 2 * Math.PI) / 5 - Math.PI / 2;
                              const r = 100 * sc;
                              return (
                                <circle
                                  key={a}
                                  cx={170 + r * Math.cos(angle)}
                                  cy={160 + r * Math.sin(angle)}
                                  r="4"
                                  fill="#123D46"
                                  stroke="#FFFFFF"
                                  strokeWidth="1.5"
                                />
                              );
                            })}
                          </>
                        );
                      })()}

                      {/* Labels */}
                      <text x="170" y="45" textAnchor="middle" className="text-[10px] font-jakarta font-bold fill-[#123D46]">
                        Relations sociales (75)
                      </text>
                      <text x="285" y="145" textAnchor="start" className="text-[10px] font-jakarta font-bold fill-[#123D46]">
                        Relations affectives (61)
                      </text>
                      <text x="240" y="275" textAnchor="middle" className="text-[10px] font-jakarta font-bold fill-[#123D46]">
                        Sens & Climat (69)
                      </text>
                      <text x="100" y="275" textAnchor="middle" className="text-[10px] font-jakarta font-bold fill-[#123D46]">
                        Dynamique pro (68)
                      </text>
                      <text x="50" y="145" textAnchor="end" className="text-[10px] font-jakarta font-bold fill-[#123D46]">
                        Relation à soi (72)
                      </text>
                    </svg>
                  </div>
                </div>

                {/* 2. Indice de Complexité Relationnelle (ICR) - Camembert (Screenshot 1) */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="pb-3 border-b border-[#E3EBE6]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                        Indice de Complexité Relationnelle (ICR)
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#123D46]/5 text-[#123D46]">
                        N = 12
                      </span>
                    </div>
                    <p className="text-xs text-[#123D46]/60">
                      Répartition du niveau d’exposition aux frictions relationnelles
                    </p>
                  </div>

                  {/* Pie Chart (Faible 33%, Modéré 33%, Critique 25% or rest) */}
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                    <svg viewBox="0 0 200 200" className="w-48 h-48">
                      {/* Slice 1: Faible (Vert #00A99D / #10B981) ~33% */}
                      {/* 120 degrees: from -90 to 30 */}
                      <path
                        d="M 100 100 L 100 10 A 90 90 0 0 1 177.94 145 Z"
                        fill="#00A99D"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      {/* Slice 2: Modéré (Orange #F59E0B / #FFC629) ~33% */}
                      {/* from 30 to 150 */}
                      <path
                        d="M 100 100 L 177.94 145 A 90 90 0 0 1 22.06 145 Z"
                        fill="#FFC629"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      {/* Slice 3: Critique (Rose #F43F5E) ~33% / 25% */}
                      <path
                        d="M 100 100 L 22.06 145 A 90 90 0 0 1 100 10 Z"
                        fill="#F43F5E"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <circle cx="100" cy="100" r="30" fill="#FFFFFF" />
                      <text x="100" y="104" textAnchor="middle" className="text-[11px] font-jakarta font-black fill-[#123D46]">
                        ICR
                      </text>
                    </svg>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-[#00A99D]" />
                        <span className="font-semibold text-[#123D46]">Faible complexité :</span>
                        <span className="font-mono font-bold text-[#00A99D]">33% (4 pers.)</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-[#FFC629]" />
                        <span className="font-semibold text-[#123D46]">Complexité modérée :</span>
                        <span className="font-mono font-bold text-amber-700">33% (4 pers.)</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-[#F43F5E]" />
                        <span className="font-semibold text-[#123D46]">Niveau critique :</span>
                        <span className="font-mono font-bold text-rose-600">25% (3 pers.)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs text-[#123D46]/80 flex items-center justify-between">
                    <span>Recommandation IRIS : 1 atelier de régulation collective préconisé.</span>
                    <button
                      onClick={() => setShowActionPlanModal(true)}
                      className="text-[#00A99D] font-bold hover:underline shrink-0 ml-2"
                    >
                      Consulter →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= SOUS-VUE B: TENDANCES & PROFILS (Image 2) ================= */}
            {subTab === 'tendances' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Évolution de l'IQRH (Graphique de courbe Screenshot 2) */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
                    <div>
                      <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                        Évolution temporelle de l'IQRH
                      </h3>
                      <p className="text-xs text-[#123D46]/60">
                        Suivi trimestriel de l’indice de santé relationnelle de la cohorte
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      +4 pts en 6 mois
                    </span>
                  </div>

                  {/* Line Chart */}
                  <div className="py-6 px-2">
                    <div className="relative h-56 w-full flex items-end justify-between border-b border-l border-[#E3EBE6] pl-6 pb-4">
                      {/* Y axis indicators */}
                      <span className="absolute -left-2 top-0 text-[10px] font-mono text-[#123D46]/50">75</span>
                      <span className="absolute -left-2 top-1/4 text-[10px] font-mono text-[#123D46]/50">72</span>
                      <span className="absolute -left-2 top-2/4 text-[10px] font-mono text-[#123D46]/50">68</span>
                      <span className="absolute -left-2 top-3/4 text-[10px] font-mono text-[#123D46]/50">65</span>

                      {/* Points & Curve */}
                      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="#00A99D"
                          strokeWidth="3"
                          points="60,160 140,120 220,130 300,70 380,50"
                        />
                      </svg>

                      {/* Timeline columns */}
                      {[
                        { date: 'T1 2026', score: 65, height: '35%' },
                        { date: 'T2 2026', score: 68, height: '48%' },
                        { date: 'T3 2026', score: 67, height: '45%' },
                        { date: 'Sept 2026', score: 71, height: '68%' },
                        { date: 'Actuel', score: 72, height: '75%' }
                      ].map((col, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 z-10">
                          <span className="text-xs font-mono font-bold text-[#00A99D] bg-white px-1 rounded shadow-2xs">
                            {col.score}
                          </span>
                          <div className="w-3 h-3 rounded-full bg-[#00A99D] ring-4 ring-white" />
                          <span className="text-[11px] text-[#123D46]/60 mt-1">{col.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Profils Relationnels (Donut Chart Screenshot 2) */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="pb-3 border-b border-[#E3EBE6]">
                    <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                      Répartition des Profils Relationnels
                    </h3>
                    <p className="text-xs text-[#123D46]/60">
                      Typologies d’interaction identifiées au sein du collectif
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                    <svg viewBox="0 0 200 200" className="w-48 h-48">
                      {/* Donut chart segments */}
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke="#00A99D"
                        strokeWidth="24"
                        strokeDasharray="220 220"
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke="#5965E8"
                        strokeWidth="24"
                        strokeDasharray="110 330"
                        strokeDashoffset="-220"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke="#FFC629"
                        strokeWidth="24"
                        strokeDasharray="80 360"
                        strokeDashoffset="-330"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke="#F43F5E"
                        strokeWidth="24"
                        strokeDasharray="30 410"
                        strokeDashoffset="-410"
                      />
                      <text x="100" y="96" textAnchor="middle" className="text-2xl font-jakarta font-black fill-[#123D46] font-mono">
                        12
                      </text>
                      <text x="100" y="114" textAnchor="middle" className="text-[10px] font-jakarta font-semibold fill-[#123D46]/60">
                        profils
                      </text>
                    </svg>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#00A99D]" />
                        <span className="font-semibold">Régulateurs & Piliers :</span>
                        <span className="font-mono text-[#00A99D] font-bold">50% (6)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#5965E8]" />
                        <span className="font-semibold">Connecteurs naturels :</span>
                        <span className="font-mono text-[#5965E8] font-bold">25% (3)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#FFC629]" />
                        <span className="font-semibold">Observateurs calmes :</span>
                        <span className="font-mono text-amber-700 font-bold">17% (2)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="font-semibold">Profils en retrait :</span>
                        <span className="font-mono text-rose-600 font-bold">8% (1)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs text-[#123D46]/70">
                    💡 <span className="font-semibold text-[#123D46]">Analyse Sociologique :</span> Forte présence de régulateurs garantissant la stabilité, mais vigilance recommandée sur les profils en retrait.
                  </div>
                </div>
              </div>
            )}

            {/* ================= SOUS-VUE C: RECOMMANDATIONS & LEVIERS (Image 3) ================= */}
            {subTab === 'recommandations' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Top Vulnérabilités (Risques) - Screenshot 3 */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3EBE6]">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                        Top Vulnérabilités (Risques)
                      </h3>
                      <p className="text-xs text-[#123D46]/60">
                        Points de friction prioritaires signalés par les répondants
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Manque de reconnaissance', value: 67, color: 'bg-rose-500' },
                      { label: 'Conflits latents non résolus', value: 67, color: 'bg-rose-500' },
                      { label: 'Charge de travail ressentie', value: 42, color: 'bg-amber-500' },
                      { label: 'Sentiment d’isolement', value: 25, color: 'bg-amber-400' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#123D46]">{item.label}</span>
                          <span className="font-mono font-bold text-rose-600">{item.value}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#F4F1E8] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all duration-500`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setShowActionPlanModal(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-jakarta font-bold transition-colors text-center"
                    >
                      Déployer le protocole de reconnaissance IRIS →
                    </button>
                  </div>
                </div>

                {/* 2. Top Forces (Protections) - Screenshot 3 */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3EBE6]">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                        Top Forces (Protections)
                      </h3>
                      <p className="text-xs text-[#123D46]/60">
                        Ressources relationnelles et amortisseurs de crise
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Autonomie dans l’organisation', value: 58, color: 'bg-[#00A99D]' },
                      { label: 'Soutien managérial direct', value: 50, color: 'bg-[#00A99D]' },
                      { label: 'Flexibilité des horaires & équilibre', value: 50, color: 'bg-[#00A99D]' },
                      { label: 'Esprit d’équipe & solidarité', value: 46, color: 'bg-[#199E9A]' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#123D46]">{item.label}</span>
                          <span className="font-mono font-bold text-emerald-700">{item.value}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#F4F1E8] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all duration-500`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => addToast('Export PDF', "Fiche de rituel d'équipe exportée en PDF !", 'success')}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-jakarta font-bold transition-colors text-center"
                    >
                      Renforcer ces atouts dans le plan d'action →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: GESTION DES CAMPAGNES (Image 4)                                    */}
        {/* ========================================================================= */}
        {activeTab === 'campagnes' && (
          <div className="space-y-6">
            {/* Breadcrumb & Header (Screenshot 4) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#123D46]/60 mb-1">
                  <Home className="w-3.5 h-3.5 text-[#00A99D]" />
                  <span>&rsaquo;</span>
                  <button onClick={() => setActiveTab('observatoire')} className="hover:text-[#00A99D]">
                    Observatoire
                  </button>
                  <span>&rsaquo;</span>
                  <span className="font-semibold text-[#123D46]">Campagnes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-jakarta font-extrabold text-[#123D46]">
                      Gestion des Campagnes
                    </h1>
                    <p className="text-xs text-[#123D46]/70">
                      Suivez vos campagnes IQRH — RGPD garanti
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Retour à l'Observatoire + Nouvelle Campagne */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('observatoire')}
                  className="px-3.5 py-2 rounded-xl border border-[#E3EBE6] text-xs font-jakarta font-semibold text-[#123D46] hover:bg-[#F4F1E8] transition-colors"
                >
                  Retour à l'Observatoire
                </button>
                <button
                  onClick={() => setShowNewCampaignModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle campagne</span>
                </button>
              </div>
            </div>

            {/* Campagnes Actives (1) List (Screenshot 4) */}
            <div className="space-y-3">
              <span className="text-xs font-jakarta font-bold text-[#123D46]/70 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>CAMPAGNES ACTIVES ({campaigns.length})</span>
              </span>

              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs hover:border-[#00A99D]/40 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3EBE6]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-jakarta font-bold text-base text-[#123D46]">
                        {camp.title}
                      </span>
                      {camp.isPremium && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Premium</span>
                        </span>
                      )}
                      {camp.isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#123D46]/60 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{camp.startDate} — {camp.endDate}</span>
                      </span>
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {camp.daysRemaining} j restants
                      </span>
                    </div>
                  </div>

                  {/* 3 Metric Columns: INVITÉS / COMPLÉTÉES / TAUX */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E3EBE6]">
                      <span className="text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider block">
                        INVITÉS
                      </span>
                      <div className="text-3xl font-jakarta font-black text-[#123D46] font-mono mt-1">
                        {camp.invitedCount}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E3EBE6]">
                      <span className="text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider block">
                        COMPLÉTÉES
                      </span>
                      <div className="text-3xl font-jakarta font-black text-[#00A99D] font-mono mt-1">
                        {camp.completedCount}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E3EBE6]">
                      <span className="text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider block">
                        TAUX DE PARTICIPATION
                      </span>
                      <div className="text-3xl font-jakarta font-black text-[#5965E8] font-mono mt-1">
                        {camp.rate}%
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#123D46]/60">
                      Pôle ciblé : <span className="font-semibold text-[#123D46]">{camp.targetDepartment}</span>
                    </span>
                    <button
                      onClick={() => addToast('Relance envoyée', "Relance anonyme envoyée par email aux participants n'ayant pas encore complété.", 'info')}
                      className="text-xs font-jakarta font-bold text-[#00A99D] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Envoyer une relance anonyme</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COLLECTIFS & PÔLES (Garantie de k-anonymat RGPD)                    */}
        {/* ========================================================================= */}
        {activeTab === 'collectifs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight">
                  {partnerMode === 'b2b'
                    ? 'Collectifs & Directions (B2B)'
                    : partnerMode === 'b2b2c'
                    ? 'Groupes d’Adhérents & Filières (B2B2C)'
                    : 'Pôles & Services Publics (B2G)'}
                </h1>
                <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                  Gestion des cohortes et vérification du seuil d’anonymat strict (k ≥ 5 répondants).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => addToast('Nouvelle cohorte', 'Invitation d’un nouveau département ajoutée.', 'success')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Ajouter un collectif</span>
                </button>
              </div>
            </div>

            {/* Banner RGPD Explanatory Card */}
            <div className="p-4 rounded-2xl bg-white border border-[#E3EBE6] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-jakarta font-bold text-sm text-[#123D46]">
                    Bouclier de Confidentialité & Seuil k-anonymat (k = 5)
                  </h4>
                  <p className="text-xs text-[#123D46]/75 mt-0.5 max-w-3xl leading-relaxed">
                    Afin de protéger la liberté d'expression des répondants, aucun score ni verbatims n'est calculé pour un pôle ou une tranche de population comptant moins de 5 évaluations finalisées.
                  </p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-jakarta font-bold whitespace-nowrap border border-emerald-200">
                100% Conforme CNIL & RGPD
              </div>
            </div>

            {/* Cohorts / Departments Table */}
            <div className="bg-white rounded-2xl border border-[#E3EBE6] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F5] border-b border-[#E3EBE6] text-[#123D46]/60 font-jakarta font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Pôle / Collectif</th>
                      <th className="py-3.5 px-4">Effectif ciblé</th>
                      <th className="py-3.5 px-4">Réponses validées</th>
                      <th className="py-3.5 px-4">Taux de participation</th>
                      <th className="py-3.5 px-4">Statut k-anonymat</th>
                      <th className="py-3.5 px-4">Indice IQRH Moyen</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3EBE6]">
                    {[
                      {
                        name: 'Direction Générale & Stratégie',
                        size: 8,
                        responses: 7,
                        rate: 87.5,
                        kSafe: true,
                        iqrh: 78.4,
                        manager: 'Sophie Laurent'
                      },
                      {
                        name: 'Pôle Opérations & Logistique',
                        size: 24,
                        responses: 19,
                        rate: 79.2,
                        kSafe: true,
                        iqrh: 64.1,
                        manager: 'Marc Levêque'
                      },
                      {
                        name: 'Pôle Ingénierie & Produit',
                        size: 16,
                        responses: 14,
                        rate: 87.5,
                        kSafe: true,
                        iqrh: 72.8,
                        manager: 'Thomas V.'
                      },
                      {
                        name: 'Service Relations Adhérents / Clients',
                        size: 12,
                        responses: 9,
                        rate: 75.0,
                        kSafe: true,
                        iqrh: 69.5,
                        manager: 'Claire M.'
                      },
                      {
                        name: 'Antenne Territoriale Sud (Pilote)',
                        size: 4,
                        responses: 3,
                        rate: 75.0,
                        kSafe: false,
                        iqrh: null,
                        manager: 'Julien B.'
                      }
                    ].map((dept, idx) => (
                      <tr key={idx} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="font-jakarta font-bold text-[#123D46]">{dept.name}</div>
                          <div className="text-[11px] text-[#123D46]/60">Référent : {dept.manager}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#123D46]">{dept.size} pers.</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#00A99D]">{dept.responses}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-[#E3EBE6] overflow-hidden">
                              <div
                                className="h-full bg-[#00A99D] rounded-full"
                                style={{ width: `${dept.rate}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-[#123D46]">{dept.rate}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {dept.kSafe ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>k ≥ 5 Validé</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200/60" title="Moins de 5 répondants : données masquées pour préserver l'anonymat">
                              <AlertTriangle className="w-3 h-3" />
                              <span>k &lt; 5 (Masqué)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {dept.iqrh !== null ? (
                            <span className="font-mono font-extrabold text-sm text-[#123D46]">
                              {dept.iqrh} <span className="text-[10px] text-[#123D46]/60">/100</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#123D46]/40 italic">Seuil insuffisant</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => addToast('Relance ciblée', `Relance anonyme envoyée pour : ${dept.name}`, 'info')}
                            className="px-2.5 py-1 rounded-lg border border-[#E3EBE6] hover:border-[#00A99D] hover:text-[#00A99D] text-[11px] font-jakarta font-semibold transition-colors"
                          >
                            Relancer
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

        {/* ========================================================================= */}
        {/* TAB 4: RAPPORTS & RESTITUTIONS (Packs CSE, Bilans QVT & CODIR)             */}
        {/* ========================================================================= */}
        {activeTab === 'rapports' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight">
                  Rapports & Restitutions Stratégiques
                </h1>
                <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                  Documents officiels, fiches pour les représentants du personnel (CSE) et synthèses d’aide à la décision.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToast('Export Global', 'Génération du rapport global en cours...', 'info')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#123D46] hover:bg-[#0D2530] text-white text-xs font-jakarta font-bold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tout exporter (Pack ZIP)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Report 1: Bilan Social & QVT */}
              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                      Bilan Annuel Qualité Relationnelle 2026
                    </h3>
                    <p className="text-xs text-[#123D46]/70 mt-1 leading-relaxed">
                      Synthèse complète de l'indice IQRH, cartographie des 5 dimensions et évolution trimestrielle.
                    </p>
                  </div>
                  <div className="text-[11px] text-[#123D46]/60 space-y-1 pt-1">
                    <div>Format : PDF Haute Définition (18 pages)</div>
                    <div>Dernière mise à jour : 02 Octobre 2026</div>
                  </div>
                </div>

                <button
                  onClick={() => addToast('Téléchargement', 'Bilan Annuel QVT 2026 téléchargé.', 'success')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger le PDF</span>
                </button>
              </div>

              {/* Report 2: Pack CSE & Dialogue Social */}
              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                      Fiche Synthèse CSE & Dialogue Social
                    </h3>
                    <p className="text-xs text-[#123D46]/70 mt-1 leading-relaxed">
                      Cadrage neutre et bienveillant des ressentis collectifs, prêt à être présenté en commission QVCT.
                    </p>
                  </div>
                  <div className="text-[11px] text-[#123D46]/60 space-y-1 pt-1">
                    <div>Format : Diaporama Présentation (PPTX & PDF)</div>
                    <div>Conformité : Accord National Interprofessionnel</div>
                  </div>
                </div>

                <button
                  onClick={() => addToast('Téléchargement', 'Fiche Synthèse CSE téléchargée.', 'success')}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E3EBE6] hover:border-[#5965E8] text-[#123D46] hover:text-[#5965E8] font-jakarta font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger le Kit CSE</span>
                </button>
              </div>

              {/* Report 3: Fiche d'Impact & Rituels IRIS */}
              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFC629]/20 text-[#D97706] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                      Matrice des Rituels & Plan d’Action
                    </h3>
                    <p className="text-xs text-[#123D46]/70 mt-1 leading-relaxed">
                      Feuille de route opérationnelle pour les managers de proximité : les 3 rituels clés recommandés.
                    </p>
                  </div>
                  <div className="text-[11px] text-[#123D46]/60 space-y-1 pt-1">
                    <div>Format : Fiche Action Manager A4</div>
                    <div>Statut : Plan validé à J+30</div>
                  </div>
                </div>

                <button
                  onClick={() => addToast('Téléchargement', "Plan d'action managérial téléchargé.", 'success')}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E3EBE6] hover:border-[#00A99D] text-[#123D46] hover:text-[#00A99D] font-jakarta font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger la Fiche</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== 3. MODALS ==================== */}

      {/* Modal 1: Nouvelle Campagne */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 bg-[#123D46]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3EBE6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00A99D]" />
                <h3 className="font-jakarta font-bold text-lg text-[#123D46]">
                  Lancer une Nouvelle Campagne IQRH
                </h3>
              </div>
              <button
                onClick={() => setShowNewCampaignModal(false)}
                className="p-1 rounded-lg text-[#123D46]/50 hover:bg-[#F4F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[#123D46] mb-1">Nom de la campagne *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Baromètre QVT Hiver 2026"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#123D46] mb-1">Date de début</label>
                  <input
                    type="date"
                    value={newCampaignStartDate}
                    onChange={(e) => setNewCampaignStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#123D46] mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={newCampaignEndDate}
                    onChange={(e) => setNewCampaignEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#123D46] mb-1">Périmètre / Population ciblée</label>
                <input
                  type="text"
                  value={newCampaignTarget}
                  onChange={(e) => setNewCampaignTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#00A99D]/5 border border-[#00A99D]/20 text-[11px] text-[#123D46] space-y-1">
                <span className="font-bold flex items-center gap-1 text-[#00A99D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Garantie RGPD & Anonymat
                </span>
                <p className="text-[#123D46]/75">
                  Les liens d'accès envoyés sont individuels mais à usage unique sans corrélation possible avec l'identité du répondant.
                </p>
              </div>

              <div className="pt-3 border-t border-[#E3EBE6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCampaignModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E3EBE6] text-[#123D46] hover:bg-[#F4F1E8]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold shadow-xs"
                >
                  Créer et Démarrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Plan d'action d'Équipe */}
      {showActionPlanModal && (
        <div className="fixed inset-0 z-50 bg-[#123D46]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3EBE6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#5965E8]" />
                <h3 className="font-jakarta font-bold text-lg text-[#123D46]">
                  Plan d'Action Recommandé par IRIS
                </h3>
              </div>
              <button
                onClick={() => setShowActionPlanModal(false)}
                className="p-1 rounded-lg text-[#123D46]/50 hover:bg-[#F4F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#123D46]/75">
                Sur la base des vulnérabilités prioritaires (Manque de reconnaissance : 67%, Conflits latents : 67%), voici les 3 micro-actions préconisées :
              </p>

              <div className="p-3.5 rounded-xl border border-[#E3EBE6] bg-[#F8F9FA] space-y-1">
                <span className="font-bold text-[#123D46] block">1. Rituel "Feedback Miroir" (15 min)</span>
                <span className="text-[11px] text-[#123D46]/70">À animer par les managers lors du prochain point bi-mensuel pour désamorcer les non-dits.</span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E3EBE6] bg-[#F8F9FA] space-y-1">
                <span className="font-bold text-[#123D46] block">2. Campagne de micro-défis "Temps sans écran"</span>
                <span className="text-[11px] text-[#123D46]/70">Favorise l'écoute active et la qualité de présence pendant les réunions d'équipe.</span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E3EBE6] bg-[#F8F9FA] space-y-1">
                <span className="font-bold text-[#123D46] block">3. Baromètre d'étape à J+30</span>
                <span className="text-[11px] text-[#123D46]/70">Micro-sondage flash (3 questions) pour mesurer le rétablissement de la sécurité psychologique.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3EBE6] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowActionPlanModal(false)}
                className="px-4 py-2 rounded-xl bg-[#123D46] text-white font-jakarta font-semibold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global In-App Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
