"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  Users, BarChart3, Settings, Mail, RefreshCw, Target,
  CheckCircle2, Clock, Calendar, Copy, QrCode, Link2,
  MapPin, ShieldCheck, Check, Building2
} from "lucide-react";
import Link from "next/link";
import { DashboardTabs } from "@/components/ui/DashboardTabs";
import { SubscriptionBadge } from "@/components/ui/SubscriptionBadge";

type Tab = "participation" | "kit" | "configuration";

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  DRAFT: { label: "Brouillon", badgeClass: "bg-slate-100 text-slate-700 border-slate-200" },
  PLANIFIEE: { label: "Planifiée", badgeClass: "bg-sky-50 text-sky-700 border-sky-200" },
  ACTIVE: { label: "Active", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EN_CLOTURE: { label: "En clôture", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  CLOSED: { label: "Clôturée", badgeClass: "bg-slate-100 text-slate-600 border-slate-200" },
  RENOUVELEE: { label: "Renouvelée", badgeClass: "bg-teal-50 text-teal-700 border-teal-200" },
};

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams?.get("tab") as Tab) || "participation";
  const [activeTab, setActiveTab] = useState<Tab>(
    ["participation", "kit", "configuration"].includes(initialTab) ? initialTab : "participation"
  );

  useEffect(() => {
    const tabParam = searchParams?.get("tab") as Tab;
    if (tabParam && ["participation", "kit", "configuration"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as Tab);
    const p = new URLSearchParams(searchParams ? searchParams.toString() : "");
    p.set("tab", key);
    router.replace(`/dashboard/b2g/campaigns/${id}?${p.toString()}`, { scroll: false });
  };

  const [campaign, setCampaign] = useState<any>(null);
  const [participation, setParticipation] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const loadCampaign = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/campaigns/" + id),
        fetch("/api/campaigns/" + id + "/stats").catch(() => ({ ok: false })),
      ]);
      if (r1.ok) {
        const d = await r1.json();
        setCampaign(d.campaign);
        setEditForm({
          title: d.campaign.title,
          description: d.campaign.description || "",
          startDate: d.campaign.startDate ? new Date(d.campaign.startDate).toISOString().split("T")[0] : "",
          endDate: d.campaign.endDate ? new Date(d.campaign.endDate).toISOString().split("T")[0] : "",
          status: d.campaign.status,
          targetPopulation: d.campaign.targetPopulation?.toString() || "",
        });
      }
      if ((r2 as any).ok) {
        const d = await (r2 as any).json();
        setStats(d);
        setParticipation(d.participation);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  useEffect(() => {
    if (activeTab === "kit") {
      fetch("/api/b2b/invite?campaignId=" + id)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setInviteData(d));
    }
  }, [activeTab, id]);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const payload: any = {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
      };
      if (editForm.startDate) payload.startDate = editForm.startDate;
      if (editForm.endDate) payload.endDate = editForm.endDate;
      if (editForm.targetPopulation !== undefined && editForm.targetPopulation !== "") {
        payload.targetPopulation = parseInt(editForm.targetPopulation, 10);
      }
      const r = await fetch("/api/campaigns/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        await loadCampaign();
        setEditMode(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (inviteData?.inviteUrl) {
      navigator.clipboard.writeText(inviteData.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="page-main">
          <div className="page-container-wide text-center py-20 text-[#123D46]/60 font-jakarta">
            <div className="w-8 h-8 border-3 border-[#00A99D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Chargement de la campagne...
          </div>
        </main>
      </>
    );
  }

  if (!campaign) {
    return (
      <>
        <Navbar />
        <main className="page-main">
          <div className="page-container-wide text-center py-20 text-rose-500 font-jakarta">
            Campagne introuvable
          </div>
        </main>
      </>
    );
  }

  const isPP = campaign.offer === "PREMIUM_PLUS";
  const statusMeta = STATUS_CONFIG[campaign.status] || {
    label: campaign.status,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const TABS = [
    { key: "participation", label: "Participation & Citoyens", icon: Users },
    { key: "kit", label: "Kit de Déploiement", icon: QrCode },
    { key: "configuration", label: "Paramètres de la campagne", icon: Settings },
  ];

  return (
    <>
      <Navbar />
      <main className="page-main font-inter">
        <div className="page-container-wide relative z-1 space-y-6">
          <Breadcrumb
            homeHref="/dashboard/b2g"
            items={[
              { label: "Observatoire Territoire", href: "/dashboard/b2g" },
              { label: "Campagnes", href: "/dashboard/b2g/campaigns" },
              { label: campaign.title },
            ]}
          />

          {/* En-tête */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46] tracking-tight">
                  {campaign.title}
                </h1>
                <SubscriptionBadge tier={isPP ? "PREMIUM_PLUS" : "PREMIUM"} size="sm" />
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-jakarta font-bold border ${statusMeta.badgeClass}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#123D46]/70 flex items-center gap-4 flex-wrap">
                {campaign.territory && (
                  <span className="flex items-center gap-1.5 font-semibold text-[#123D46]">
                    <MapPin className="w-4 h-4 text-[#00A99D]" />
                    {campaign.territory}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#00A99D]" />
                  Du {new Date(campaign.startDate).toLocaleDateString("fr-FR")} au{" "}
                  {new Date(campaign.endDate).toLocaleDateString("fr-FR")}
                </span>
                {campaign.targetPopulation && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#00A99D]" />
                    {campaign.targetPopulation.toLocaleString("fr-FR")} citoyens cibles
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/dashboard/b2g?campaignId=${id}`}
                className="px-4 py-2.5 rounded-full bg-white border border-[#E3EBE6] text-[#123D46] font-jakarta font-bold text-xs hover:border-[#00A99D] hover:text-[#00A99D] hover:bg-[#FAF9F5] transition-all flex items-center gap-2 shadow-2xs"
              >
                <BarChart3 className="w-4 h-4 text-[#00A99D]" />
                Voir l'observatoire
              </Link>
              {["CLOSED", "RENOUVELEE"].includes(campaign.status) && (
                <Link
                  href={"/dashboard/b2g/campaigns/" + id + "/renew"}
                  className="px-4 py-2.5 rounded-full bg-[#FFC629] text-[#123D46] font-jakarta font-bold text-xs hover:bg-[#eab308] transition-all flex items-center gap-2 shadow-2xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renouveler la campagne
                </Link>
              )}
            </div>
          </div>

          {/* Onglets */}
          <DashboardTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

          {/* TAB 1: Participation */}
          {activeTab === "participation" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Citoyens sensibilisés",
                    value: participation?.invited ?? 0,
                    color: "text-sky-600",
                    bg: "bg-sky-50 border-sky-100",
                    icon: Mail,
                  },
                  {
                    label: "Comptes citoyens actifs",
                    value: participation?.activated ?? 0,
                    color: "text-[#00A99D]",
                    bg: "bg-[#00A99D]/10 border-[#00A99D]/20",
                    icon: CheckCircle2,
                  },
                  {
                    label: "Évaluations entamées",
                    value: participation?.started ?? 0,
                    color: "text-amber-600",
                    bg: "bg-amber-50 border-amber-100",
                    icon: Clock,
                  },
                  {
                    label: "Bilans complétés",
                    value: participation?.completed ?? 0,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50 border-emerald-100",
                    icon: CheckCircle2,
                  },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                  <div
                    key={label}
                    className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs text-center space-y-3"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${bg} border flex items-center justify-center mx-auto`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <p className={`text-3xl font-jakarta font-extrabold ${color}`}>{value}</p>
                    <p className="text-xs font-jakarta font-semibold text-[#123D46]/70 uppercase tracking-wide">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {campaign?.targetPopulation && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex justify-between items-center text-xs font-jakarta font-semibold">
                    <span className="text-[#123D46]">
                      Objectif de participation territoriale
                    </span>
                    <span className="text-[#123D46] font-bold">
                      {participation?.completed ?? 0} /{" "}
                      {campaign.targetPopulation.toLocaleString("fr-FR")} citoyens
                    </span>
                  </div>
                  <div className="w-full bg-[#F4F1E8] h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00A99D] to-emerald-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((participation?.completed ?? 0) / campaign.targetPopulation) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Kit de Déploiement */}
          {activeTab === "kit" && (
            <div className="flex justify-center animate-fade-in">
              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-8 shadow-xs max-w-xl w-full space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center mx-auto mb-2">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-jakarta font-extrabold text-[#123D46]">
                    Lien et QR Code d'Accès Citoyen
                  </h2>
                  <p className="text-xs text-[#123D46]/70 leading-relaxed max-w-md mx-auto">
                    Diffusez ce QR code ou ce lien sur vos supports municipaux pour inviter les
                    administrés à participer à l'évaluation.
                  </p>
                </div>

                {inviteData ? (
                  <div className="space-y-5">
                    <div className="bg-[#FAF9F5] border border-[#E3EBE6] rounded-2xl p-6 text-center shadow-2xs">
                      <img
                        src={inviteData.qrCode}
                        alt="QR Code"
                        className="w-44 h-44 mx-auto rounded-xl border border-[#E3EBE6] bg-white p-2 shadow-xs"
                      />
                      <p className="text-xs font-jakarta font-bold text-[#123D46] mt-4">
                        Code d'accès territoire :{" "}
                        <span className="font-mono bg-[#00A99D]/15 text-[#00A99D] px-2.5 py-1 rounded-md text-xs border border-[#00A99D]/20">
                          {inviteData.codeAccess}
                        </span>
                      </p>
                    </div>

                    <div className="bg-white border border-[#E3EBE6] rounded-xl p-3 flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-[#123D46]/60 shrink-0" />
                      <span className="text-xs text-[#123D46]/80 flex-1 truncate font-mono">
                        {inviteData.inviteUrl}
                      </span>
                      <button
                        onClick={copyLink}
                        className="px-3 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#E3EBE6] text-[#123D46] text-xs font-jakarta font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={copyLink}
                      className="w-full py-3 px-5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Lien copié dans le presse-papier !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier le lien de déploiement
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      fetch("/api/b2b/invite?campaignId=" + id)
                        .then((r) => (r.ok ? r.json() : null))
                        .then((d) => d && setInviteData(d))
                    }
                    className="w-full py-3 px-5 rounded-full bg-white border border-[#E3EBE6] hover:border-[#00A99D] hover:text-[#00A99D] text-[#123D46] font-jakarta font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-[#00A99D]" />
                    Générer le Kit Citoyen
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Configuration */}
          {activeTab === "configuration" && (
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EBE6]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-jakarta font-extrabold text-[#123D46]">
                      Paramètres & Configuration de la Campagne Territoriale
                    </h2>
                    <p className="text-xs text-[#123D46]/65 mt-0.5">
                      Gérez les paramètres généraux, la population cible et les dates de
                      l'enquête.
                    </p>
                  </div>
                </div>

                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-5 py-2.5 rounded-full bg-white border border-[#E3EBE6] text-[#123D46] hover:border-[#00A99D] hover:text-[#00A99D] font-jakarta font-bold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <Settings className="w-4 h-4 text-[#00A99D]" />
                    Modifier les paramètres
                  </button>
                ) : (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 rounded-full bg-white border border-[#E3EBE6] text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#FAF9F5] font-jakarta font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="px-5 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                  </div>
                )}
              </div>

              {!editMode && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="bg-[#FAF9F5] border border-[#E3EBE6] rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]/60">
                        <Target className="w-3.5 h-3.5 text-[#00A99D]" />
                        Nom de la campagne
                      </div>
                      <p className="text-base font-jakarta font-bold text-[#123D46]">
                        {campaign.title}
                      </p>
                      <p className="text-xs text-[#123D46]/70 leading-relaxed">
                        {campaign.description || "Aucune description renseignée."}
                      </p>
                    </div>

                    <div className="bg-[#FAF9F5] border border-[#E3EBE6] rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]/60">
                        <Calendar className="w-3.5 h-3.5 text-[#00A99D]" />
                        Calendrier & Statut
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-jakarta font-bold border ${statusMeta.badgeClass}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="text-xs text-[#123D46]/80 space-y-1">
                        <p>
                          <strong>Début :</strong>{" "}
                          {new Date(campaign.startDate).toLocaleDateString("fr-FR")}
                        </p>
                        <p>
                          <strong>Fin :</strong>{" "}
                          {new Date(campaign.endDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#FAF9F5] border border-[#E3EBE6] rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]/60">
                        <Users className="w-3.5 h-3.5 text-[#00A99D]" />
                        Territoire & Population
                      </div>
                      <div className="flex items-center gap-2">
                        <SubscriptionBadge tier={isPP ? "PREMIUM_PLUS" : "PREMIUM"} size="sm" />
                      </div>
                      <p className="text-xs text-[#123D46]/80">
                        <strong>Population cible :</strong>{" "}
                        {campaign.targetPopulation
                          ? `${campaign.targetPopulation.toLocaleString("fr-FR")} citoyens`
                          : "Non spécifié"}
                      </p>
                      {campaign.territory && (
                        <p className="text-xs text-[#123D46]/80">
                          <strong>Territoire :</strong> {campaign.territory}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#00A99D]/5 border border-[#00A99D]/20 flex items-start gap-3 text-xs text-[#123D46]">
                    <ShieldCheck className="w-5 h-5 text-[#00A99D] shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <p className="font-jakarta font-bold text-[#00A99D]">
                        Garantie d'anonymat & Confidentialité RGPD
                      </p>
                      <p className="text-[#123D46]/75">
                        Les données territoriales sont agrégées et anonymisées. Aucun croisement
                        n'est possible avec l'état civil des répondants.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {editMode && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]">
                        Nom de la campagne *
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((f: any) => ({ ...f, title: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-sm text-[#123D46] focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]">
                        Population cible (citoyens)
                      </label>
                      <input
                        type="number"
                        value={editForm.targetPopulation}
                        onChange={(e) =>
                          setEditForm((f: any) => ({ ...f, targetPopulation: e.target.value }))
                        }
                        placeholder="Ex: 1000"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-sm text-[#123D46] focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]">
                        Statut opérationnel
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm((f: any) => ({ ...f, status: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-sm text-[#123D46] bg-white focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] focus:outline-none transition-all cursor-pointer"
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) =>
                          setEditForm((f: any) => ({ ...f, startDate: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-sm text-[#123D46] focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) =>
                          setEditForm((f: any) => ({ ...f, endDate: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-sm text-[#123D46] focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]">
                        Description
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((f: any) => ({ ...f, description: e.target.value }))
                        }
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-sm text-[#123D46] focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] focus:outline-none transition-all placeholder:text-[#94a3b8]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-5 py-2.5 rounded-full border border-[#E3EBE6] text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#FAF9F5] font-jakarta font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
