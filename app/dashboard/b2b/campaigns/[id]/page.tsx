"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PartnerAdminHeader } from "@/src/components/dashboard/PartnerAdminHeader";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  Users, BarChart3, Settings, Mail, RefreshCw, Target,
  CheckCircle2, Clock, Calendar, Copy, QrCode, Link2,
  Plus, ShieldCheck, Sparkles, Building2, Check, ExternalLink, AlertTriangle, List
} from "lucide-react";
import Link from "next/link";
import { DashboardTabs } from "@/components/ui/DashboardTabs";
import { SubscriptionBadge } from "@/components/ui/SubscriptionBadge";

type Tab = "participation" | "configuration" | "invitations";

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  DRAFT: { label: "Brouillon", badgeClass: "bg-slate-100 text-slate-700 border-slate-200" },
  PLANIFIEE: { label: "Planifiée", badgeClass: "bg-sky-50 text-sky-700 border-sky-200" },
  ACTIVE: { label: "Active", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EN_CLOTURE: { label: "En clôture", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  CLOSED: { label: "Clôturée", badgeClass: "bg-slate-100 text-slate-600 border-slate-200" },
  RENOUVELEE: { label: "Renouvelée", badgeClass: "bg-teal-50 text-teal-700 border-teal-200" }
};

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;

  const initialTab = (searchParams?.get("tab") as Tab) || "participation";
  const [activeTab, setActiveTab] = useState<Tab>(
    ["participation", "configuration", "invitations"].includes(initialTab) ? initialTab : "participation"
  );

  useEffect(() => {
    const tabParam = searchParams?.get("tab") as Tab;
    if (tabParam && ["participation", "configuration", "invitations"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as Tab);
    const p = new URLSearchParams(searchParams ? searchParams.toString() : "");
    p.set("tab", key);
    router.replace(`/dashboard/b2b/campaigns/${id}?${p.toString()}`, { scroll: false });
  };

  const [campaign, setCampaign] = useState<any>(null);
  const [participation, setParticipation] = useState<any>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailsInput, setEmailsInput] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<any>(null);
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
        fetch("/api/b2b/stats?campaignId=" + id).catch(() => ({ ok: false })),
      ]);
      if (r1.ok) {
        const d = await r1.json();
        setCampaign(d.campaign);
        setParticipation(d.participation);
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

  const loadInvites = useCallback(async () => {
    const r = await fetch("/api/campaigns/" + id + "/invites");
    if (r.ok) {
      const d = await r.json();
      setInvites(d.invites || []);
    }
  }, [id]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  useEffect(() => {
    if (activeTab === "invitations") {
      loadInvites();
      fetch("/api/b2b/invite?campaignId=" + id)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setInviteData(d));
    }
  }, [activeTab, loadInvites, id]);

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
      if (campaign?.offer === "PREMIUM_PLUS") {
        payload.questionnaireConfig = {
          ...(campaign.questionnaireConfig || {}),
          binomeEnabled: !!editForm.binomeEnabled,
          requireSameDepartment: !!editForm.requireSameDepartment,
        };
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

  const handleAddInvites = async () => {
    const emails = emailsInput
      .split(/[\n,;]/)
      .map((e: string) => e.trim())
      .filter((e: string) => e.includes("@"));
    if (!emails.length) return;
    setInviteLoading(true);
    try {
      const r = await fetch("/api/campaigns/" + id + "/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      if (r.ok) {
        const d = await r.json();
        setInviteResult(d.results);
        setEmailsInput("");
        loadInvites();
      }
    } finally {
      setInviteLoading(false);
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
      <div className="min-h-screen bg-[#F4F1E8] text-[#123D46] font-inter flex flex-col selection:bg-[#00A99D]/20 selection:text-[#123D46]">
        <PartnerAdminHeader portalType="B2B" activeTab="campagnes" />
        <main className="page-main">
          <div className="page-container-wide text-center py-20 text-[#123D46]/60 font-jakarta">
            <div className="w-8 h-8 border-3 border-[#00A99D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Chargement de la campagne...
          </div>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#F4F1E8] text-[#123D46] font-inter flex flex-col selection:bg-[#00A99D]/20 selection:text-[#123D46]">
        <PartnerAdminHeader portalType="B2B" activeTab="campagnes" />
        <main className="page-main">
          <div className="page-container-wide text-center py-20 text-rose-500 font-jakarta">
            Campagne introuvable
          </div>
        </main>
      </div>
    );
  }

  const isPP = campaign.offer === "PREMIUM_PLUS";
  const statusMeta = STATUS_CONFIG[campaign.status] || {
    label: campaign.status,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const TABS = [
    { key: "participation", label: "Participation & Métriques", icon: Users },
    { key: "invitations", label: "Invitations & Déploiement", icon: Mail },
    { key: "configuration", label: "Paramètres de la campagne", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1E8] text-[#123D46] font-inter flex flex-col selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      <PartnerAdminHeader portalType="B2B" activeTab="campagnes" />
      <main className="page-main font-inter">
        <div className="page-container-wide relative z-1 space-y-6">
          <Breadcrumb
            homeHref="/dashboard/b2b"
            items={[
              { label: "Tableau de bord B2B", href: "/dashboard/b2b" },
              { label: "Campagnes", href: "/dashboard/b2b/campaigns" },
              { label: campaign.title },
            ]}
          />

          {/* En-tête de la campagne */}
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
                    {campaign.targetPopulation.toLocaleString("fr-FR")} collaborateurs cibles
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
                href={`/dashboard/b2b?campaignId=${id}`}
                className="px-4 py-2.5 rounded-full bg-white border border-[#E3EBE6] text-[#123D46] font-jakarta font-bold text-xs hover:border-[#00A99D] hover:text-[#00A99D] hover:bg-[#FAF9F5] transition-all flex items-center gap-2 shadow-2xs"
              >
                <BarChart3 className="w-4 h-4 text-[#00A99D]" />
                Voir les statistiques
              </Link>
              {["CLOSED", "RENOUVELEE"].includes(campaign.status) && (
                <Link
                  href={"/dashboard/b2b/campaigns/" + id + "/renew"}
                  className="px-4 py-2.5 rounded-full bg-[#FFC629] text-[#123D46] font-jakarta font-bold text-xs hover:bg-[#eab308] transition-all flex items-center gap-2 shadow-2xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renouveler la campagne
                </Link>
              )}
            </div>
          </div>

          {/* Onglets de navigation */}
          <DashboardTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

          {/* TAB 1: Participation & Métriques */}
          {activeTab === "participation" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Collaborateurs invités",
                    value: participation?.invited ?? 0,
                    color: "text-sky-600",
                    bg: "bg-sky-50 border-sky-100",
                    icon: Mail,
                  },
                  {
                    label: "Comptes activés",
                    value: participation?.activated ?? 0,
                    color: "text-[#00A99D]",
                    bg: "bg-[#00A99D]/10 border-[#00A99D]/20",
                    icon: CheckCircle2,
                  },
                  {
                    label: "Passations entamées",
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

              {(participation?.invited ?? 0) > 0 && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-jakarta font-extrabold text-[#123D46]">
                        Entonnoir d'engagement & participation
                      </h3>
                      <p className="text-xs text-[#123D46]/60 mt-0.5">
                        Taux de conversion aux étapes clés du questionnaire IQRH
                      </p>
                    </div>
                    <span className="text-xs font-jakarta font-bold text-[#00A99D] bg-[#00A99D]/10 px-3 py-1 rounded-full border border-[#00A99D]/20">
                      Taux final : {participation?.completionRate ?? 0}%
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        label: "Collaborateurs invités",
                        value: participation.invited,
                        color: "bg-sky-500",
                      },
                      {
                        label: "Comptes activés",
                        value: participation.activated,
                        color: "bg-[#00A99D]",
                      },
                      {
                        label: "Questionnaires commencés",
                        value: participation.started,
                        color: "bg-amber-500",
                      },
                      {
                        label: "Questionnaires complétés",
                        value: participation.completed,
                        color: "bg-emerald-500",
                      },
                    ].map(({ label, value, color }) => {
                      const pct =
                        participation.invited > 0
                          ? Math.round((value / participation.invited) * 100)
                          : 0;
                      return (
                        <div key={label} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-jakarta font-semibold">
                            <span className="text-[#123D46]">{label}</span>
                            <span className="text-[#123D46]">
                              {value}{" "}
                              <span className="text-[#123D46]/45 font-medium ml-1">
                                ({pct}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-[#F4F1E8] h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${color} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Invitations & Déploiement */}
          {activeTab === "invitations" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulaire d'ajout */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center font-bold">
                        <Mail className="w-4 h-4" />
                      </div>
                      <h2 className="text-base font-jakarta font-bold text-[#123D46]">
                        Importer des bénéficiaires
                      </h2>
                    </div>
                    <p className="text-xs text-[#123D46]/70 leading-relaxed">
                      Saisissez les adresses emails de vos collaborateurs (séparées par une virgule,
                      un point-virgule ou un retour à la ligne).
                    </p>
                    <textarea
                      value={emailsInput}
                      onChange={(e) => setEmailsInput(e.target.value)}
                      placeholder={"jean.dupont@entreprise.com\nmarie.martin@entreprise.com"}
                      className="w-full min-h-[140px] p-3.5 rounded-xl border border-[#E3EBE6] text-xs font-mono text-[#123D46] focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] focus:outline-none transition-all placeholder:text-[#94a3b8]"
                    />
                    {inviteResult && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-jakarta font-semibold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {inviteResult.created} invitation(s) ajoutée(s), {inviteResult.duplicates}{" "}
                          doublon(s) ignoré(s).
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddInvites}
                    disabled={inviteLoading || !emailsInput.trim()}
                    className="w-full py-2.5 px-4 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {inviteLoading ? (
                      "Ajout en cours..."
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Envoyer les invitations
                      </>
                    )}
                  </button>
                </div>

                {/* Lien et QR Code */}
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center font-bold">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <h2 className="text-base font-jakarta font-bold text-[#123D46]">
                        Lien direct & QR Code d'accès
                      </h2>
                    </div>
                    <p className="text-xs text-[#123D46]/70 leading-relaxed">
                      Communiquez ce lien ou affichez le QR Code dans vos locaux pour permettre aux
                      collaborateurs d'accéder directement à la campagne.
                    </p>

                    {inviteData ? (
                      <div className="space-y-4">
                        <div className="bg-[#FAF9F5] border border-[#E3EBE6] rounded-2xl p-4 text-center">
                          <img
                            src={inviteData.qrCode}
                            alt="QR Code"
                            className="w-36 h-36 mx-auto rounded-xl border border-[#E3EBE6] bg-white p-2 shadow-2xs"
                          />
                          <p className="text-xs font-jakarta font-bold text-[#123D46] mt-3">
                            Code d'accès :{" "}
                            <span className="font-mono bg-[#00A99D]/15 text-[#00A99D] px-2 py-0.5 rounded-md text-xs border border-[#00A99D]/20">
                              {inviteData.codeAccess}
                            </span>
                          </p>
                        </div>

                        <div className="bg-white border border-[#E3EBE6] rounded-xl p-2.5 flex items-center gap-2">
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
                      </div>
                    ) : (
                      <div className="py-12 text-center text-[#123D46]/60 text-xs">
                        Chargement des informations de déploiement...
                      </div>
                    )}
                  </div>

                  {inviteData && (
                    <button
                      onClick={copyLink}
                      className="w-full py-2.5 px-4 rounded-full bg-white border border-[#E3EBE6] hover:border-[#00A99D] hover:text-[#00A99D] text-[#123D46] font-jakarta font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Lien copié dans le presse-papier !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier le lien de la campagne
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Tableau des bénéficiaires */}
              {invites.length > 0 && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-jakarta font-bold text-[#123D46]">
                      Bénéficiaires enregistrés ({invites.length})
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E3EBE6] bg-[#FAF9F5]">
                          <th className="py-3 px-4 text-left font-jakarta font-bold text-[#123D46]/70 uppercase tracking-wider text-[11px]">
                            Email
                          </th>
                          <th className="py-3 px-4 text-left font-jakarta font-bold text-[#123D46]/70 uppercase tracking-wider text-[11px]">
                            Statut
                          </th>
                          <th className="py-3 px-4 text-left font-jakarta font-bold text-[#123D46]/70 uppercase tracking-wider text-[11px]">
                            Date d'invitation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBE6]/60">
                        {invites.map((inv: any) => {
                          const sc: Record<string, { label: string; cls: string }> = {
                            INVITED: {
                              label: "Invité",
                              cls: "bg-sky-50 text-sky-700 border-sky-200",
                            },
                            ACTIVATED: {
                              label: "Activé",
                              cls: "bg-teal-50 text-teal-700 border-teal-200",
                            },
                            STARTED: {
                              label: "Commencé",
                              cls: "bg-amber-50 text-amber-700 border-amber-200",
                            },
                            COMPLETED: {
                              label: "Complété",
                              cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
                            },
                          };
                          const meta = sc[inv.status] || {
                            label: inv.status,
                            cls: "bg-slate-100 text-slate-700 border-slate-200",
                          };
                          return (
                            <tr key={inv.id} className="hover:bg-[#FAF9F5] transition-colors">
                              <td className="py-3 px-4 font-mono text-[#123D46]">{inv.email}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-jakarta font-bold border ${meta.cls}`}
                                >
                                  {meta.label}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-[#123D46]/70">
                                {new Date(inv.invitedAt).toLocaleDateString("fr-FR")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Configuration (Paramètres) */}
          {activeTab === "configuration" && (
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8 animate-fade-in">
              {/* Header de la carte Paramètres */}
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
                      Gérez les informations générales, le calendrier opérationnel et les règles
                      associées.
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

              {/* Mode LECTURE (Design moderne haut de gamme) */}
              {!editMode && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Bloc 1: Informations Générales */}
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

                    {/* Bloc 2: Période & Statut */}
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

                    {/* Bloc 3: Population & Offre */}
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
                          ? `${campaign.targetPopulation.toLocaleString("fr-FR")} bénéficiaires`
                          : "Non spécifié"}
                      </p>
                      <p className="text-xs text-[#123D46]/80">
                        <strong>Organisation :</strong>{" "}
                        {campaign.organization?.name || "Entreprise"}
                      </p>
                    </div>
                  </div>

                  {/* Bloc 4: Options Avancées & Binôme (PREMIUM_PLUS) */}
                  {isPP && (
                    <div className="bg-white border border-[#00A99D]/25 rounded-2xl p-5 space-y-3 bg-gradient-to-r from-[#00A99D]/5 to-transparent">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#00A99D]" />
                        <h3 className="font-jakarta font-bold text-sm text-[#123D46]">
                          Options de l'offre Premium Plus
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
                            Module Binôme Relationnel :{" "}
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
                                ? "Imposé"
                                : "Libre"}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bloc 5: Questionnaires et variables complémentaires */}
                  <div className="bg-[#FAF9F5] border border-[#E3EBE6] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]/60">
                        <List className="w-3.5 h-3.5 text-[#00A99D]" />
                        Questionnaires complémentaires ({campaign.CampaignVariable?.length || 0})
                      </div>
                      <span className="text-[11px] text-[#123D46]/50">
                        Posées après le questionnaire IQRH
                      </span>
                    </div>
                    {campaign.CampaignVariable && campaign.CampaignVariable.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {campaign.CampaignVariable.map((cv: any) => (
                          <div key={cv.id} className="bg-white border border-[#E3EBE6] rounded-xl p-3.5 text-xs shadow-2xs space-y-1.5">
                            <p className="font-bold text-[#123D46]">{cv.question}</p>
                            {cv.options && Array.isArray(cv.options) && cv.options.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {cv.options.map((opt: string, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E3EBE6] text-[10px] text-[#123D46]/70">
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#123D46]/50 italic">Réponse libre</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#123D46]/60 italic py-2">
                        Aucun questionnaire ou variable complémentaire configuré pour cette campagne.
                      </p>
                    )}
                  </div>

                  {/* Bloc 6: Historique si Renouvellement */}
                  {campaign.parentCampaign && (
                    <div className="p-4 rounded-2xl bg-[#5965E8]/8 border border-[#5965E8]/20 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-jakarta font-bold text-[#5965E8]">
                          Renouvellement de campagne
                        </p>
                        <p className="text-xs text-[#123D46]">
                          Cette campagne succède à :{" "}
                          <strong className="font-semibold">{campaign.parentCampaign.title}</strong>{" "}
                          ({campaign.parentCampaign.offer})
                        </p>
                      </div>
                      <Link
                        href={"/dashboard/b2b/campaigns/" + campaign.parentCampaign.id}
                        className="px-3 py-1.5 rounded-full bg-white border border-[#E3EBE6] text-xs font-jakarta font-bold text-[#5965E8] hover:bg-[#FAF9F5] transition-colors flex items-center gap-1.5"
                      >
                        Voir la campagne parente <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {/* Bloc 7: Sécurité & RGPD */}
                  <div className="p-4 rounded-2xl bg-[#00A99D]/5 border border-[#00A99D]/20 flex items-start gap-3 text-xs text-[#123D46]">
                    <ShieldCheck className="w-5 h-5 text-[#00A99D] shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <p className="font-jakarta font-bold text-[#00A99D]">
                        Garantie d'anonymat & Confidentialité RGPD
                      </p>
                      <p className="text-[#123D46]/75">
                        Conformément au protocole LinkOffice, les résultats consolidés ne sont
                        accessibles qu'à partir d'un seuil minimum de 5 réponses complétées afin de
                        préserver l'anonymat strict de chaque répondant.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode ÉDITION */}
              {editMode && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nom */}
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

                    {/* Population cible */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]">
                        Population cible (bénéficiaires)
                      </label>
                      <input
                        type="number"
                        value={editForm.targetPopulation}
                        onChange={(e) =>
                          setEditForm((f: any) => ({ ...f, targetPopulation: e.target.value }))
                        }
                        placeholder="Ex: 250"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-sm text-[#123D46] focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] focus:outline-none transition-all"
                      />
                    </div>

                    {/* Statut */}
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

                    {/* Date de début */}
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

                    {/* Date de fin */}
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

                    {/* Description */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-jakarta font-bold uppercase tracking-wider text-[#123D46]">
                        Description & Objectifs internes
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

                  {/* Options Binôme en mode édition */}
                  {isPP && (
                    <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] space-y-4">
                      <div className="flex items-center gap-2 text-xs font-jakarta font-bold uppercase tracking-wider text-[#00A99D]">
                        <Sparkles className="w-3.5 h-3.5" />
                        Options de l'offre Premium Plus
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
                              Activer le module Binôme Relationnel
                            </span>
                            <span className="text-[#123D46]/70">
                              Permet aux collaborateurs de former des binômes d'accompagnement.
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
                              Limite les suggestions de binôme au département du collaborateur.
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
    </div>
  );
}