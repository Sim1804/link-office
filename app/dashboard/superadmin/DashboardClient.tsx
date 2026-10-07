
"use client";

import { Building2, Handshake, Users, ChevronRight, Activity, BookOpen, LayoutDashboard, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BarometreDashboard } from "@/components/superadmin/barometre/BarometreDashboard";

interface DashboardClientProps {
  stats: {
    orgsTotal: number;
    orgsB2B: number;
    orgsB2B2C: number;
    orgsB2G: number;
    leadsUrgent: number;
    leadsTotal: number;
    usersTotal: number;
    mediaTotal: number;
    recentLeads?: any[];
  };
  availableRegions: string[];
}

const KPI_CARDS = [
  {
    key: "orgs",
    label: "Organisations",
    accentColor: "emerald",
    icon: Building2,
    badge: "+12% T1",
    badgeColor: "#00A99D",
  },
  {
    key: "leads",
    label: "Devis Entrants",
    accentColor: "amber",
    icon: Handshake,
    badge: null,
    badgeColor: "#f59e0b",
  },
  {
    key: "users",
    label: "Comptes Rattachés",
    accentColor: "indigo",
    icon: Users,
    badge: null,
    badgeColor: "#6366f1",
  },
  {
    key: "media",
    label: "Médias Actifs",
    accentColor: "emerald",
    icon: BookOpen,
    badge: null,
    badgeColor: "#10b981",
  },
];

export function DashboardClient({ stats, availableRegions }: DashboardClientProps) {
  const [mainTab, setMainTab] = useState("general");

  const kpiValues: Record<string, { value: string | number; sub?: string }> = {
    orgs: {
      value: stats.orgsTotal,
      sub: `${stats.orgsB2B} B2B · ${stats.orgsB2B2C} Mutuelles · ${stats.orgsB2G} Collectivités`,
    },
    leads: {
      value: stats.leadsTotal,
      sub: stats.leadsUrgent > 0 ? `${stats.leadsUrgent} nécessitent une action urgente` : "Tous traités · Aucun en attente",
    },
    users: {
      value: stats.usersTotal.toLocaleString("fr-FR"),
      sub: "Employés, DRH et bénéficiaires",
    },
    media: {
      value: stats.mediaTotal,
      sub: "Articles, podcasts et recommandations",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
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

        {/* Sub-tabs Dashboard 360 */}
        <div className="inline-flex p-1 bg-white border border-[#E3EBE6] rounded-full self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setMainTab('general')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-jakarta font-semibold transition-colors ${
              mainTab === 'general'
                ? 'bg-[#00A99D]/15 text-[#00A99D]'
                : 'text-[#123D46]/70 hover:text-[#123D46]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Vue Générale</span>
          </button>
          <button
            onClick={() => setMainTab('barometre')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-jakarta font-semibold transition-colors ${
              mainTab === 'barometre'
                ? 'bg-[#00A99D]/15 text-[#00A99D]'
                : 'text-[#123D46]/70 hover:text-[#123D46]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Baromètre National</span>
          </button>
        </div>
      </div>

      {mainTab === "general" && (
        <div className="space-y-6">
          {/* 4 Stat KPI Cards */}
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
                  {kpiValues.orgs.value}
                </span>
                <span className="text-[11px] font-jakarta font-bold text-[#00A99D] bg-[#00A99D]/10 px-1.5 py-0.5 rounded">
                  +12% T1
                </span>
              </div>
              <p className="text-xs text-[#123D46]/60 mt-2">
                {kpiValues.orgs.sub}
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
                  {kpiValues.leads.value}
                </span>
                <span className="text-[11px] font-jakarta font-medium text-[#123D46]/60">
                  en attente
                </span>
              </div>
              <p className="text-xs text-[#123D46]/60 mt-2">
                {kpiValues.leads.sub}
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
                  {kpiValues.users.value}
                </span>
              </div>
              <p className="text-xs text-[#123D46]/60 mt-2">
                {kpiValues.users.sub}
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
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
                  {kpiValues.media.value}
                </span>
                <span className="text-[11px] font-jakarta font-medium text-[#123D46]/60">
                  en ligne
                </span>
              </div>
              <p className="text-xs text-[#123D46]/60 mt-2">
                {kpiValues.media.sub}
              </p>
            </div>
          </div>

          {/* Pipeline Entrant */}
          <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Handshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#123D46]">Pipeline Entrant</h3>
                  <p className="text-[11px] text-[#123D46]/70">Nouvelles demandes à traiter</p>
                </div>
              </div>
              <Link href="/dashboard/superadmin/leads" className="text-xs font-semibold text-[#00A99D] hover:underline flex items-center gap-1">
                Voir tout <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentLeads && stats.recentLeads.length > 0 ? (
                stats.recentLeads.map((lead: any) => (
                  <div key={lead.id} className="bg-[#F8F9FA] border border-[#E3EBE6] rounded-xl p-4 flex flex-col gap-2 hover:border-[#00A99D]/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-bold text-[#123D46]">{lead.organization}</div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#5965E8]/10 text-[#5965E8] uppercase">{lead.planType}</span>
                    </div>
                    <div className="text-xs text-[#123D46]/70 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {lead.companySize || lead.populationSize || lead.beneficiaries || "N/A"} personnes
                    </div>
                    <Link href="/dashboard/superadmin/leads" className="mt-2 block w-full text-center py-2 rounded-full bg-white border border-[#E3EBE6] text-xs font-bold text-[#123D46] hover:bg-[#00A99D] hover:text-white hover:border-[#00A99D] transition-colors">
                      Inspecter & Convertir
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-[#123D46]/50 text-xs border border-dashed border-[#E3EBE6] rounded-xl">
                  Aucun lead entrant en attente.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mainTab === "barometre" && (
        <BarometreDashboard availableRegions={availableRegions} />
      )}
    </div>
  );
}
