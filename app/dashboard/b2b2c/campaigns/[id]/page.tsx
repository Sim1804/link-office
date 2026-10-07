"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  BarChart3, Target, CheckCircle2, Copy, QrCode, Link2, Calendar,
  Users, Settings, ShieldCheck, Sparkles, Building2, Check, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { DashboardTabs } from "@/components/ui/DashboardTabs";
import { SubscriptionBadge } from "@/components/ui/SubscriptionBadge";

type Tab = "kit" | "configuration";

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  DRAFT: { label: "Brouillon", badgeClass: "bg-slate-100 text-slate-700 border-slate-200" },
  PLANIFIEE: { label: "Planifiée", badgeClass: "bg-sky-50 text-sky-700 border-sky-200" },
  ACTIVE: { label: "Active", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EN_CLOTURE: { label: "En clôture", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  CLOSED: { label: "Clôturée", badgeClass: "bg-slate-100 text-slate-600 border-slate-200" },
  RENOUVELEE: { label: "Renouvelée", badgeClass: "bg-teal-50 text-teal-700 border-teal-200" },
};

export default function PartnerCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;

  const initialTab = (searchParams?.get("tab") as Tab) || "kit";
  const [activeTab, setActiveTab] = useState<Tab>(
    ["kit", "configuration"].includes(initialTab) ? initialTab : "kit"
  );

  useEffect(() => {
    const tabParam = searchParams?.get("tab") as Tab;
    if (tabParam && ["kit", "configuration"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as Tab);
    const p = new URLSearchParams(searchParams ? searchParams.toString() : "");
    p.set("tab", key);
    router.replace(`/dashboard/b2b2c/campaigns/${id}?${p.toString()}`, { scroll: false });
  };

  const [campaign, setCampaign] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const loadCampaign = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/campaigns/" + id),
        fetch("/api/b2b/stats?campaignId=" + id).catch(() => ({ ok: false })),
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
          binomeEnabled: d.campaign.questionnaireConfig?.binomeEnabled ?? false,
          requireSameDepartment: d.campaign.questionnaireConfig?.requireSameDepartment ?? false,
        });
      }
      if ((r2 as any).ok) setStats(await (r2 as any).json());
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

  const copyLink = () => {
    if (inviteData?.inviteUrl) {
      navigator.clipboard.writeText(inviteData.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const payload: any = {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        questionnaireConfig: {
          ...(campaign.questionnaireConfig || {}),
          binomeEnabled: editForm.binomeEnabled,
          requireSameDepartment: editForm.requireSameDepartment,
        },
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
    { key: "kit", label: "Kit de déploiement", icon: QrCode },
    { key: "configuration", label: "Paramètres de la campagne", icon: Settings },
  ];

  return (
    <>
      <Navbar />
      <main className="page-main font-inter">
        <div className="page-container-wide relative z-1 space-y-6">
          <Breadcrumb
            homeHref="/dashboard/b2b2c"
            items={[
              { label: "Portail Mutuelle", href: "/dashboard/b2b2c" },
              { label: "Campagnes", href: "/dashboard/b2b2c/campaigns" },
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
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#00A99D]" />
                  Du {new Date(campaign.startDate).toLocaleDateString("fr-FR")} au{" "}
                  {new Date(campaign.endDate).toLocaleDateString("fr-FR")}
                </span>
                {campaign.targetPopulation && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#00A99D]" />
                    {campaign.targetPopulation.toLocaleString("fr-FR")} bénéficiaires cibles
                  </span>
                )}
                {campaign.organization?.name && (
                  <span className="flex items-center gap-1.5 text-[#123D46]/50">
                    <Building2 className="w-4 h-4" />
                    {campaign.organization.name}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/dashboard/b2b2c?campaignId=${id}`}
                className="px-4 py-2.5 rounded-full bg-white border border-[#E3EBE6] text-[#123D46] font-jakarta font-bold text-xs hover:border-[#00A99D] hover:text-[#00A99D] hover:bg-[#FAF9F5] transition-all flex items-center gap-2 shadow-2xs"
              >
                <BarChart3 className="w-4 h-4 text-[#00A99D]" />
                Voir les statistiques
              </Link>
              {["CLOSED", "RENOUVELEE"].includes(campaign.status) && (
                <Link
                  href={"/dashboard/b2b2c/campaigns/" + id + "/renew"}
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

          {/* TAB 1: Kit de Déploiement */}
          {activeTab === "kit" && (
            <div className="flex justify-center animate-fade-in">
              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-8 shadow-xs max-w-xl w-full space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center mx-auto mb-2">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-jakarta font-extrabold text-[#123D46]">
                    Lien et QR Code de Déploiement
                  </h2>
                  <p className="text-xs text-[#123D46]/70 leading-relaxed max-w-md mx-auto">
                    Distribuez ce QR code ou ce lien à vos adhérents pour qu'ils puissent rejoindre
                    directement l'évaluation IQRH.
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
                        Code de campagne :{" "}
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
                    Générer le Kit de Déploiement
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Configuration */}
          {activeTab === "configuration" && (
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EBE6]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-jakarta font-extrabold text-[#123D46]">
                      Paramètres & Configuration de la Campagne
                    </h2>
                    <p className="text-xs text-[#123D46]/65 mt-0.5">
                      Gérez les paramètres généraux et les options de matching de la mutuelle.
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
                        Périmètre & Offre
                      </div>
                      <div className="flex items-center gap-2">
                        <SubscriptionBadge tier={isPP ? "PREMIUM_PLUS" : "PREMIUM"} size="sm" />
                      </div>
                      <p className="text-xs text-[#123D46]/80">
                        <strong>Population cible :</strong>{" "}
                        {campaign.targetPopulation
                          ? `${campaign.targetPopulation.toLocaleString("fr-FR")} adhérents`
                          : "Non spécifié"}
                      </p>
                    </div>
                  </div>

                  {isPP && (
                    <div className="bg-white border border-[#00A99D]/25 rounded-2xl p-5 space-y-3 bg-gradient-to-r from-[#00A99D]/5 to-transparent">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#00A99D]" />
                        <h3 className="font-jakarta font-bold text-sm text-[#123D46]">
                          Règles du Binôme Relationnel
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              campaign.questionnaireConfig?.binomeEnabled
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {campaign.questionnaireConfig?.binomeEnabled ? "✓" : "✕"}
                          </div>
                          <span className="text-[#123D46] font-medium">
                            Module Binôme :{" "}
                            <strong>
                              {campaign.questionnaireConfig?.binomeEnabled ? "Activé" : "Désactivé"}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              campaign.questionnaireConfig?.requireSameDepartment
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {campaign.questionnaireConfig?.requireSameDepartment ? "✓" : "✕"}
                          </div>
                          <span className="text-[#123D46] font-medium">
                            Matching même département :{" "}
                            <strong>
                              {campaign.questionnaireConfig?.requireSameDepartment
                                ? "Restreint"
                                : "Libre"}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-[#00A99D]/5 border border-[#00A99D]/20 flex items-start gap-3 text-xs text-[#123D46]">
                    <ShieldCheck className="w-5 h-5 text-[#00A99D] shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <p className="font-jakarta font-bold text-[#00A99D]">
                        Garantie d'anonymat & Confidentialité RGPD
                      </p>
                      <p className="text-[#123D46]/75">
                        Les liens d'accès distribués aux adhérents garantissent un anonymat total.
                        Aucune corrélation directe n'est établie avec les données personnelles de
                        l'assuré.
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
                        Population cible (adhérents)
                      </label>
                      <input
                        type="number"
                        value={editForm.targetPopulation}
                        onChange={(e) =>
                          setEditForm((f: any) => ({ ...f, targetPopulation: e.target.value }))
                        }
                        placeholder="Ex: 500"
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

                  {isPP && (
                    <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] space-y-4">
                      <div className="flex items-center gap-2 text-xs font-jakarta font-bold uppercase tracking-wider text-[#00A99D]">
                        <Sparkles className="w-3.5 h-3.5" />
                        Options Binôme Relationnel
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.binomeEnabled}
                            onChange={(e) =>
                              setEditForm((f: any) => ({ ...f, binomeEnabled: e.target.checked }))
                            }
                            className="mt-1 w-4 h-4 rounded text-[#00A99D] focus:ring-[#00A99D] accent-[#00A99D]"
                          />
                          <div className="text-xs">
                            <span className="font-jakarta font-bold text-[#123D46] block">
                              Activer le module Binôme
                            </span>
                            <span className="text-[#123D46]/70">
                              Permet aux adhérents de former des binômes d'entraide.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.requireSameDepartment}
                            onChange={(e) =>
                              setEditForm((f: any) => ({
                                ...f,
                                requireSameDepartment: e.target.checked,
                              }))
                            }
                            className="mt-1 w-4 h-4 rounded text-[#00A99D] focus:ring-[#00A99D] accent-[#00A99D]"
                          />
                          <div className="text-xs">
                            <span className="font-jakarta font-bold text-[#123D46] block">
                              Restreindre au même département
                            </span>
                            <span className="text-[#123D46]/70">
                              Limite les suggestions de binôme à la zone géographique de l'adhérent.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

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
