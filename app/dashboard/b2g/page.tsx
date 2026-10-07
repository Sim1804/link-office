
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Logo } from "@/src/components/brand/Logo";
import {
  Bell, ChevronDown, Building2, Calendar, Users, ShieldCheck, TrendingUp,
  Activity, Award, Sparkles, ArrowUpRight, Plus, RefreshCw, Home,
  CheckCircle2, AlertTriangle, FileText, Filter, Layers, HeartHandshake, LogOut, X, Target, PieChart as PieChartIcon, TrendingDown, Briefcase, Lightbulb, User, BarChart as BarChart3,
  Clock, Archive, ChevronRight, Mail, Link2, Copy, QrCode, Settings
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, Cell, PieChart, Pie, Legend, LineChart, Line, CartesianGrid, PolarRadiusAxis
} from "recharts";
import Link from "next/link";
import {
  buildIcrData,
  buildRadarData,
  buildWeatherData,
} from "@/lib/constants/dashboard";
import { Select } from "@/components/ui/Select";
import { PartnerAdminHeader } from "@/src/components/dashboard/PartnerAdminHeader";
import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";

export default function B2GDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  
  // Campaigns State
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [selectedCampaignForDetail, setSelectedCampaignForDetail] = useState<any>(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'observatoire' | 'consultations'>('observatoire');
  const [subTab, setSubTab] = useState<'generale' | 'tendances' | 'recommandations'>('generale');

  // Menus & Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showActionPlanModal, setShowActionPlanModal] = useState(false);

  // New Campaign Form State
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignStartDate, setNewCampaignStartDate] = useState('2026-10-15');
  const [newCampaignEndDate, setNewCampaignEndDate] = useState('2026-11-15');
  const [newCampaignTarget, setNewCampaignTarget] = useState('Tous les citoyens');

  // Actions
  const [addingActionId, setAddingActionId] = useState<string | null>(null);
  const [addedActionIds, setAddedActionIds] = useState<string[]>([]);

  const handleAddToActionPlan = async (rec: any) => {
    setAddingActionId(rec.id);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rec.title,
          description: rec.description,
          status: "PROPOSEE",
          priority: "MEDIUM",
          campaignId: selectedCampaignId || undefined,
        })
      });
      if (res.ok) {
        setAddedActionIds(prev => [...prev, rec.id]);
      }
    } finally {
      setAddingActionId(null);
    }
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle) return;
    // Call API here in real life
    setShowNewCampaignModal(false);
    setNewCampaignTitle('');
    alert('Nouvelle consultation lancée avec invitations anonymisées sécurisées !');
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCampaignId) params.append("campaignId", selectedCampaignId);
    if (ageRange) params.append("ageRange", ageRange);
    if (gender) params.append("gender", gender);

    fetch(`/api/b2b/stats?${params.toString()}`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [selectedCampaignId, ageRange, gender]);

  useEffect(() => {
    if (activeTab === 'consultations' && campaigns.length === 0) {
      setCampaignsLoading(true);
      fetch("/api/campaigns")
        .then(r => r.json())
        .then(d => { if (d.campaigns) setCampaigns(d.campaigns); })
        .finally(() => setCampaignsLoading(false));
    }
  }, [activeTab, campaigns.length]);

  const radarData = buildRadarData(stats?.averages ?? {});
  const icrData = stats?.icrDistribution ? buildIcrData(stats.icrDistribution) : [];
  const weatherData = stats?.weatherDistribution ? buildWeatherData(stats.weatherDistribution) : [];
  
  const dims = [
    { name: "Social", score: stats?.averages?.social || 0 },
    { name: "Affectif", score: stats?.averages?.affective || 0 },
    { name: "Sentimental", score: stats?.averages?.sentimental || 0 },
    { name: "Pro", score: stats?.averages?.professional || 0 },
    { name: "Soi", score: stats?.averages?.self || 0 }
  ];
  const sortedDims = [...dims].sort((a, b) => b.score - a.score);
  const topDim = sortedDims[0];
  const flopDim = sortedDims[sortedDims.length - 1];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#123D46] font-inter flex flex-col selection:bg-[#F26D35]/20 selection:text-[#123D46]">
      {/* 1. TOP NAVBAR SPÉCIFIQUE ADMIN B2B */}
      <PartnerAdminHeader
        portalType="B2G"
        themeColor="#F26D35"
        adminTitle="Admin Collectivité B2G"
        adminSubtitle="Observatoire Territoire"
        tabs={[{id:'observatoire',label:'Observatoire'},{id:'campagnes',label:'Consultations Citoyennes'}]}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as any)}
      />

      <PartnerPortalsNavigation />

      {/* 2. CONTENU PRINCIPAL DU PORTAIL RH */}
      <main className="flex-1 max-w-[1480px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        
        {activeTab === 'observatoire' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Filtres */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[#F26D35]" /> Observatoire du Territoire
                </h1>
                <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                  Analysez l'écosystème relationnel de vos citoyens et identifiez les leviers d'action.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  {stats?.campaignsList && stats.campaignsList.length > 0 && (
                    <Select
                      value={selectedCampaignId}
                      onChange={setSelectedCampaignId}
                      options={[
                        { value: '', label: 'Toutes les consultations' },
                        ...stats.campaignsList.map((c: any) => ({ value: c.id, label: c.title }))
                      ]}
                      className="text-[11px] font-jakarta font-semibold py-2 px-3 min-w-[170px]"
                    />
                  )}
                  <Select
                    value={ageRange}
                    onChange={setAgeRange}
                    options={[
                      { value: '', label: 'Tous âges' },
                      { value: '18-25', label: '18-25 ans' },
                      { value: '26-35', label: '26-35 ans' },
                      { value: '36-45', label: '36-45 ans' },
                      { value: '46+', label: '46 ans et +' }
                    ]}
                    className="text-[11px] font-jakarta font-semibold py-2 px-3 min-w-[120px]"
                  />
                  <Select
                    value={gender}
                    onChange={setGender}
                    options={[
                      { value: '', label: 'Tous genres' },
                      { value: 'Femme', label: 'Femmes' },
                      { value: 'Homme', label: 'Hommes' }
                    ]}
                    className="text-[11px] font-jakarta font-semibold py-2 px-3 min-w-[120px]"
                  />
                </div>

                <div className="flex items-center gap-4 text-xs font-jakarta font-semibold mt-1">
                  <button
                    onClick={() => setActiveTab('consultations')}
                    className="text-[#123D46]/75 hover:text-[#F26D35] transition-colors"
                  >
                    Gérer les consultations
                  </button>
                  <button
                    onClick={() => setShowActionPlanModal(true)}
                    className="text-[#F26D35] hover:underline transition-colors font-bold"
                  >
                    Plan d'action
                  </button>
                </div>
              </div>
            </div>

            {/* Sous-onglets Observatoire */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => setSubTab('generale')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-jakarta font-semibold transition-all ${
                  subTab === 'generale' ? 'bg-[#F26D35]/15 text-[#F26D35] ring-1 ring-[#F26D35]/30 font-bold' : 'bg-white border border-[#E3EBE6] text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/50'
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Vue Générale
              </button>
              <button
                onClick={() => setSubTab('tendances')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-jakarta font-semibold transition-all ${
                  subTab === 'tendances' ? 'bg-[#F26D35]/15 text-[#F26D35] ring-1 ring-[#F26D35]/30 font-bold' : 'bg-white border border-[#E3EBE6] text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Tendances & Profils
              </button>
              <button
                onClick={() => setSubTab('recommandations')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-jakarta font-semibold transition-all ${
                  subTab === 'recommandations' ? 'bg-[#F26D35]/15 text-[#F26D35] ring-1 ring-[#F26D35]/30 font-bold' : 'bg-white border border-[#E3EBE6] text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Recommandations & Leviers
              </button>
            </div>

            {loading ? (
              <DashboardSkeleton />
            ) : stats?.anonymityBlocked ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center mt-6">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-amber-600 font-bold text-xl mb-2">
                  Données non disponibles — Anonymat protégé
                </h2>
                <p className="text-[#123D46]/70 max-w-lg mx-auto text-sm">
                  {stats.message}
                </p>
              </div>
            ) : stats && stats.averages ? (
              <>
                {/* 4 KPIs Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {/* IQRH Moyen */}
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-[#F26D35]/10 text-[#F26D35] flex items-center justify-center shrink-0">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider block">IQRH MOYEN</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-3xl font-jakarta font-black text-[#123D46] font-mono">{stats.averages.global}</span>
                        <span className="text-xs text-[#123D46]/50 font-medium">/ 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Citoyens / Agents */}
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider block">COLLABORATEURS ÉVALUÉS</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-3xl font-jakarta font-black text-[#123D46] font-mono">{stats.respondentCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Point Fort */}
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-jakarta font-bold text-emerald-700 uppercase tracking-wider block">POINT FORT</span>
                      <div className="text-lg font-jakarta font-extrabold text-[#123D46] mt-0.5">{topDim?.name || "N/A"}</div>
                      <div className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> <span>{topDim?.score || 0} / 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Fragilité */}
                  <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-jakarta font-bold text-rose-700 uppercase tracking-wider block">FRAGILITÉ</span>
                      <div className="text-lg font-jakarta font-extrabold text-[#123D46] mt-0.5">{flopDim?.name || "N/A"}</div>
                      <div className="text-xs font-mono font-bold text-rose-600 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> <span>{flopDim?.score || 0} / 100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SubTab Content */}
                {subTab === 'generale' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-in">
                    {/* Radar */}
                    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
                        <div>
                          <h3 className="font-jakarta font-bold text-base text-[#123D46]">Équilibre Relationnel Global (Radar)</h3>
                          <p className="text-xs text-[#123D46]/60">Polygone d’équilibre sur les dimensions</p>
                        </div>
                      </div>
                      <div className="w-full h-[320px]">
                        <ResponsiveContainer>
                          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                            <PolarGrid stroke="#E3EBE6" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#123D46', fontSize: 11, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                            <Radar name="Score" dataKey="score" stroke="#F26D35" strokeWidth={2.5} fill="#F26D35" fillOpacity={0.22} />
                            <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid #E3EBE6", fontSize: 12 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* ICR */}
                    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
                        <div>
                          <h3 className="font-jakarta font-bold text-base text-[#123D46]">Indice de Complexité Relationnelle (ICR)</h3>
                          <p className="text-xs text-[#123D46]/60">Niveau d’exposition aux frictions relationnelles</p>
                        </div>
                      </div>
                      <div className="w-full h-[320px]">
                        {icrData.length > 0 ? (
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie data={icrData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4}>
                                {icrData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                              </Pie>
                              <RechartsTooltip formatter={(v) => `${v} collab.`} contentStyle={{ borderRadius: 8, border: "1px solid #E3EBE6", fontSize: 12 }} />
                              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#123D46' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-[#123D46]/50">Aucune donnée ICR.</div>
                        )}
                      </div>
                    </div>

                    {/* Météo */}
                    {weatherData.length > 0 && (
                      <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs lg:col-span-2">
                        <h3 className="font-jakarta font-bold text-base text-[#123D46] mb-4">Distribution Météo Relationnelle</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weatherData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                              <XAxis type="number" tick={{ fontSize: 11, fill: "#123D46" }} stroke="#E3EBE6" />
                              <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "#123D46" }} width={120} stroke="none" />
                              <RechartsTooltip contentStyle={{ background: "white", border: "1px solid #E3EBE6", borderRadius: 8 }} />
                              <Bar dataKey="count" fill="#F26D35" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {subTab === 'tendances' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 animate-fade-in">
                    {/* Evolution IQRH */}
                    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs lg:col-span-2">
                      <h3 className="font-jakarta font-bold text-base text-[#123D46] mb-4">Évolution de l'IQRH</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer>
                          <LineChart data={stats.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EBE6" />
                            <XAxis dataKey="month" stroke="#123D46" fontSize={12} tickMargin={10} />
                            <YAxis stroke="#123D46" fontSize={12} tickMargin={10} domain={['dataMin - 5', 'dataMax + 5']} />
                            <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid #E3EBE6", fontSize: 13 }} />
                            <Line type="monotone" dataKey="score" stroke="#F26D35" strokeWidth={3} dot={{ r: 4, fill: "#F26D35", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Profils */}
                    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs">
                      <h3 className="font-jakarta font-bold text-base text-[#123D46] mb-4">Profils</h3>
                      <div className="h-[220px] mb-4">
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie data={stats.profils || []} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                              {(stats.profils || []).map((entry: any, index: number) => (
                                <Cell key={index} fill={entry.color || "#F26D35"} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid #E3EBE6" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {(stats.profils || []).map((p: any) => (
                          <div key={p.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || "#F26D35" }} />
                              <span className="text-xs text-[#123D46]/70 font-semibold">{p.name}</span>
                            </div>
                            <span className="text-xs font-bold text-[#123D46]">{p.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Moments de vie */}
                    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs lg:col-span-3">
                      <h3 className="font-jakarta font-bold text-base text-[#123D46] mb-4">IQRH moyen selon les Moments de Vie</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer>
                          <BarChart data={stats.momentsVie || []} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E3EBE6" />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#123D46', fontSize: 12 }} width={200} />
                            <RechartsTooltip cursor={{fill: '#F8F9FA'}} contentStyle={{ borderRadius: 8, border: "1px solid #E3EBE6", fontSize: 12 }} />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={24}>
                              {(stats.momentsVie || []).map((entry: any, index: number) => (
                                <Cell key={index} fill={entry.score < 50 ? "#f43f5e" : entry.score < 60 ? "#f59e0b" : "#F26D35"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {subTab === 'recommandations' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-in">
                    {/* Vulnérabilités */}
                    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs">
                      <div className="flex items-center gap-2 mb-6">
                        <TrendingDown className="text-rose-500 w-5 h-5" />
                        <h3 className="text-[#123D46] font-jakarta font-bold text-base">Top Vulnérabilités</h3>
                      </div>
                      <div className="space-y-4">
                        {(stats.topRiskFactors ?? []).map((f: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-[#123D46]/70 font-medium">{f.label}</span>
                              <span className="text-rose-600 font-bold">{f.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500" style={{ width: `${f.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Forces */}
                    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs">
                      <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="text-emerald-500 w-5 h-5" />
                        <h3 className="text-[#123D46] font-jakarta font-bold text-base">Top Forces</h3>
                      </div>
                      <div className="space-y-4">
                        {(stats.topProtectiveFactors ?? []).map((f: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-[#123D46]/70 font-medium">{f.label}</span>
                              <span className="text-emerald-600 font-bold">{f.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${f.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Besoins */}
                    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs lg:col-span-2">
                      <div className="flex items-center gap-2 mb-6">
                        <Users className="text-[#F26D35] w-5 h-5" />
                        <h3 className="text-[#123D46] font-jakarta font-bold text-base">Besoins Dominants</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {(stats.topDominantNeeds ?? []).map((n: any, i: number) => (
                          <div key={i} className="bg-[#F26D35]/5 border border-[#F26D35]/20 rounded-xl px-4 py-2 flex items-center gap-3">
                            <span className="text-[#F26D35] text-sm font-semibold">{n.label}</span>
                            <span className="bg-[#5965E8]/10 text-[#5965E8] px-2 py-0.5 rounded-full text-xs font-bold">{n.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations AI */}
                    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs lg:col-span-2">
                      <div className="flex items-center gap-2 mb-6">
                        <Lightbulb className="text-amber-500 w-5 h-5" />
                        <h3 className="text-[#123D46] font-jakarta font-bold text-base">Recommandations d'Actions</h3>
                        <span className="ml-auto bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Généré par IRIS</span>
                      </div>
                      <div className="space-y-4">
                        {(stats.recommendations ?? []).map((rec: any) => (
                          <div key={rec.id} className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E3EBE6] flex gap-4">
                             <div className="text-2xl pt-1">{rec.icon}</div>
                             <div className="flex-1">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                  <h4 className="font-bold text-[#123D46] text-sm">{rec.title}</h4>
                                  <button 
                                    onClick={() => handleAddToActionPlan(rec)}
                                    disabled={addingActionId === rec.id || addedActionIds.includes(rec.id)}
                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                                      addedActionIds.includes(rec.id) 
                                      ? "bg-purple-50 text-purple-600 border border-purple-200"
                                      : "bg-white border border-[#E3EBE6] text-[#123D46] hover:border-[#F26D35] hover:text-[#F26D35]"
                                    }`}
                                  >
                                    {addingActionId === rec.id ? "Ajout..." : addedActionIds.includes(rec.id) ? "✓ Ajoutée" : "Ajouter au plan"}
                                  </button>
                                </div>
                                <p className="text-xs text-[#123D46]/70 leading-relaxed">{rec.description}</p>
                             </div>
                          </div>
                        ))}
                        {(stats.recommendations?.length === 0) && (
                          <div className="text-center py-6 text-sm text-[#123D46]/50">Aucune recommandation disponible.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
        
        {activeTab === 'consultations' && !selectedCampaignForDetail && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-[#F26D35]" /> Consultations Citoyennes
                </h1>
                <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                  Suivez vos consultations IQRH, gérez les invitations et consultez les taux de participation.
                </p>
              </div>
              <button
                onClick={() => setShowNewCampaignModal(true)}
                className="px-5 py-2.5 rounded-full bg-[#F26D35] hover:bg-[#E85B20] text-white font-jakarta font-bold shadow-xs transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Nouvelle consultation
              </button>
            </div>

            {campaignsLoading ? (
               <DashboardSkeleton />
            ) : campaigns.length === 0 ? (
               <div className="bg-white border border-[#E3EBE6] rounded-2xl p-12 text-center shadow-xs mt-6">
                  <div className="w-16 h-16 bg-[#F26D35]/10 text-[#F26D35] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="font-jakarta font-bold text-lg text-[#123D46] mb-2">Aucune consultation active</h3>
                  <p className="text-[#123D46]/70 text-sm max-w-md mx-auto mb-6">
                    Lancez votre première consultation IQRH pour évaluer le capital relationnel de vos équipes de manière anonyme et sécurisée.
                  </p>
                  <button
                    onClick={() => setShowNewCampaignModal(true)}
                    className="px-5 py-2.5 rounded-full bg-[#F26D35] hover:bg-[#E85B20] text-white font-jakarta font-bold shadow-xs transition-colors inline-flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Créer ma première consultation
                  </button>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                 {campaigns.map(c => {
                   const isPP = c.offer === "PREMIUM_PLUS";
                   const completion = c._count?.invites > 0 ? Math.round((c._count.assessments / c._count.invites) * 100) : 0;
                   const isActive = c.status === "ACTIVE" || c.status === "EN_CLOTURE";
                   const StatusIcon = isActive ? CheckCircle2 : c.status === "PLANIFIEE" ? Clock : Archive;
                   const statusColor = isActive ? "text-emerald-600 bg-emerald-50 border-emerald-200" : c.status === "PLANIFIEE" ? "text-cyan-600 bg-cyan-50 border-cyan-200" : "text-[#123D46]/60 bg-[#F8F9FA] border-[#E3EBE6]";
                   
                   return (
                     <div key={c.id} onClick={() => setSelectedCampaignForDetail(c)} className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#F26D35]/30 transition-all cursor-pointer flex flex-col group">
                       <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-2 flex-wrap">
                           <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold flex items-center gap-1 ${statusColor}`}>
                             <StatusIcon className="w-3 h-3" /> {c.status}
                           </span>
                           {isPP && <span className="px-2 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold">PREMIUM+</span>}
                         </div>
                         <ChevronRight className="w-5 h-5 text-[#123D46]/30 group-hover:text-[#F26D35] transition-colors" />
                       </div>
                       
                       <h3 className="font-jakarta font-bold text-[#123D46] text-base mb-1 line-clamp-1">{c.title}</h3>
                       <p className="text-xs text-[#123D46]/60 flex items-center gap-1 mb-4">
                         <Calendar className="w-3.5 h-3.5" />
                         {new Date(c.startDate).toLocaleDateString("fr-FR")} - {new Date(c.endDate).toLocaleDateString("fr-FR")}
                       </p>
                       
                       <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-[#E3EBE6]">
                         <div className="text-center">
                           <div className="text-lg font-jakarta font-black text-[#123D46]">{c._count?.invites || 0}</div>
                           <div className="text-[10px] font-bold text-[#123D46]/50 uppercase">Invités</div>
                         </div>
                         <div className="text-center border-x border-[#E3EBE6]">
                           <div className="text-lg font-jakarta font-black text-[#F26D35]">{c._count?.assessments || 0}</div>
                           <div className="text-[10px] font-bold text-[#123D46]/50 uppercase">Complétés</div>
                         </div>
                         <div className="text-center">
                           <div className={`text-lg font-jakarta font-black ${completion >= 70 ? 'text-emerald-500' : completion >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>{completion}%</div>
                           <div className="text-[10px] font-bold text-[#123D46]/50 uppercase">Taux</div>
                         </div>
                       </div>
                       
                       {completion > 0 && (
                         <div className="w-full bg-[#F4F1E8] h-1.5 rounded-full mt-4 overflow-hidden">
                           <div className={`h-full rounded-full ${completion >= 70 ? 'bg-emerald-500' : completion >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${completion}%` }} />
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        )}
        
        {activeTab === 'consultations' && selectedCampaignForDetail && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center gap-3 text-sm font-semibold text-[#123D46]/60 mb-2">
                <button onClick={() => setSelectedCampaignForDetail(null)} className="hover:text-[#F26D35] flex items-center gap-1 transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-180" /> Retour aux consultations
                </button>
             </div>
             
             <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
               <div>
                 <div className="flex items-center gap-3 mb-2">
                   <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight">{selectedCampaignForDetail.title}</h1>
                   <span className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                     <CheckCircle2 className="w-3.5 h-3.5" /> {selectedCampaignForDetail.status}
                   </span>
                 </div>
                 <p className="text-sm text-[#123D46]/70 flex items-center gap-2">
                   <Calendar className="w-4 h-4" /> {new Date(selectedCampaignForDetail.startDate).toLocaleDateString("fr-FR")} au {new Date(selectedCampaignForDetail.endDate).toLocaleDateString("fr-FR")}
                   <span className="mx-2 opacity-30">•</span>
                   <Users className="w-4 h-4" /> {selectedCampaignForDetail.targetPopulation || 0} bénéficiaires cibles
                 </p>
               </div>
               
               <div className="flex gap-2">
                 <button className="px-4 py-2 rounded-xl bg-white border border-[#E3EBE6] text-[#123D46] text-sm font-bold shadow-xs hover:border-[#F26D35] hover:text-[#F26D35] transition-colors flex items-center gap-2">
                   <Settings className="w-4 h-4" /> Paramètres
                 </button>
                 <button onClick={() => { setActiveTab('observatoire'); setSelectedCampaignId(selectedCampaignForDetail.id); }} className="px-4 py-2 rounded-xl bg-[#F26D35] text-white text-sm font-bold shadow-xs hover:bg-[#E85B20] transition-colors flex items-center gap-2">
                   <BarChart3 className="w-4 h-4" /> Analyser les résultats
                 </button>
               </div>
             </div>
             
             {/* Participation & Invites Dashboard */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs lg:col-span-2">
                   <h3 className="font-jakarta font-bold text-[#123D46] text-base mb-6 flex items-center gap-2">
                     <Activity className="w-5 h-5 text-[#F26D35]" /> Entonnoir de participation
                   </h3>
                   
                   <div className="space-y-6">
                     {[
                       { label: "Bénéficiaires invités", value: selectedCampaignForDetail._count?.invites || 0, color: "bg-[#38bdf8]" },
                       { label: "Questionnaires commencés", value: Math.round((selectedCampaignForDetail._count?.invites || 0) * 0.8), color: "bg-[#f59e0b]" },
                       { label: "Questionnaires complétés", value: selectedCampaignForDetail._count?.assessments || 0, color: "bg-emerald-500" }
                     ].map((step, idx, arr) => {
                       const max = arr[0].value || 1;
                       const pct = Math.round((step.value / max) * 100);
                       return (
                         <div key={step.label}>
                           <div className="flex justify-between text-sm font-bold mb-2">
                             <span className="text-[#123D46]">{step.label}</span>
                             <span className="text-[#123D46]">{step.value} <span className="text-[#123D46]/40 font-medium ml-1">({pct}%)</span></span>
                           </div>
                           <div className="w-full bg-[#F4F1E8] h-2.5 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${step.color}`} style={{ width: `${pct}%` }} />
                           </div>
                         </div>
                       )
                     })}
                   </div>
                </div>
                
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs">
                   <h3 className="font-jakarta font-bold text-[#123D46] text-base mb-4 flex items-center gap-2">
                     <Mail className="w-5 h-5 text-[#5965E8]" /> Actions rapides
                   </h3>
                   <div className="space-y-3">
                     <button className="w-full p-4 rounded-xl border border-[#E3EBE6] hover:border-[#5965E8] hover:bg-[#5965E8]/5 transition-colors flex items-center gap-3 text-left group">
                       <div className="w-10 h-10 rounded-full bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                         <Plus className="w-5 h-5" />
                       </div>
                       <div>
                         <div className="font-bold text-[#123D46] text-sm mb-0.5">Inviter des citoyens</div>
                         <div className="text-xs text-[#123D46]/60">Import CSV ou saisie manuelle</div>
                       </div>
                     </button>
                     
                     <button className="w-full p-4 rounded-xl border border-[#E3EBE6] hover:border-[#F26D35] hover:bg-[#F26D35]/5 transition-colors flex items-center gap-3 text-left group">
                       <div className="w-10 h-10 rounded-full bg-[#F26D35]/10 text-[#F26D35] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                         <Link2 className="w-5 h-5" />
                       </div>
                       <div>
                         <div className="font-bold text-[#123D46] text-sm mb-0.5">Lien d'invitation</div>
                         <div className="text-xs text-[#123D46]/60">Copier le lien ou générer QR Code</div>
                       </div>
                     </button>
                     
                     <button className="w-full p-4 rounded-xl border border-[#E3EBE6] hover:border-amber-500 hover:bg-amber-50 transition-colors flex items-center gap-3 text-left group">
                       <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                         <Bell className="w-5 h-5" />
                       </div>
                       <div>
                         <div className="font-bold text-[#123D46] text-sm mb-0.5">Relancer les inactifs</div>
                         <div className="text-xs text-[#123D46]/60">Envoyer un rappel automatique</div>
                       </div>
                     </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* ==================== 3. MODALS ==================== */}

      {/* Modal 1: Nouvelle Campagne */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3EBE6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F26D35]" />
                <h3 className="font-jakarta font-bold text-lg text-[#123D46]">
                  Lancer une Nouvelle Consultation
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
                <label className="block text-[#123D46] mb-1">Nom de la consultation *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Baromètre QVT Hiver 2026"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#F26D35] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#123D46] mb-1">Date de début</label>
                  <input
                    type="date"
                    value={newCampaignStartDate}
                    onChange={(e) => setNewCampaignStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#F26D35] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#123D46] mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={newCampaignEndDate}
                    onChange={(e) => setNewCampaignEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#F26D35] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#123D46] mb-1">Périmètre / Population ciblée</label>
                <input
                  type="text"
                  value={newCampaignTarget}
                  onChange={(e) => setNewCampaignTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#F26D35] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F26D35]/5 border border-[#F26D35]/20 text-[11px] text-[#123D46] space-y-1">
                <span className="font-bold flex items-center gap-1 text-[#F26D35]">
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
                  className="px-5 py-2 rounded-full border border-[#E3EBE6] text-[#123D46] hover:bg-[#F4F1E8] font-jakarta font-semibold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#F26D35] hover:bg-[#E85B20] text-white font-jakarta font-bold shadow-xs text-xs"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
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
                className="px-5 py-2 rounded-full bg-[#123D46] hover:bg-[#0D2530] text-white font-jakarta font-semibold text-xs transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
