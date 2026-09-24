"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BarChart3, Target, CheckCircle2, Copy, QrCode, Link2, Zap, Crown, Calendar, Users, Settings } from "lucide-react";
import Link from "next/link";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { DashboardTabs } from "@/components/ui/DashboardTabs";

type Tab = "kit" | "configuration";

const STATUS_LABELS: Record<string,string> = { DRAFT:"Brouillon", PLANIFIEE:"Planifiée", ACTIVE:"Active", EN_CLOTURE:"En clôture", CLOSED:"Clôturée", RENOUVELEE:"Renouvelée" };
const ICR_COLORS = ["#34d399","#f59e0b","#f97316","#f43f5e"];
const DIMENSION_LABELS: Record<string,string> = { social:"Relations sociales", affective:"Relations affectives", sentimental:"Vie sentimentale", professional:"Vie pro", self:"Relation à soi" };

export default function PartnerCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [activeTab, setActiveTab] = useState<Tab>("kit");
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
          endDate: new Date(d.campaign.endDate).toISOString().split("T")[0],
          status: d.campaign.status,
          binomeEnabled: d.campaign.questionnaireConfig?.binomeEnabled ?? false,
          requireSameDepartment: d.campaign.questionnaireConfig?.requireSameDepartment ?? false,
        });
      }
      if ((r2 as any).ok) setStats(await (r2 as any).json());
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadCampaign(); }, [loadCampaign]);
  useEffect(() => { if (activeTab === "kit") fetch("/api/b2b/invite?campaignId=" + id).then(r => r.ok ? r.json() : null).then(d => d && setInviteData(d)); }, [activeTab, id]);

  const copyLink = () => {
    if (inviteData?.inviteUrl) { navigator.clipboard.writeText(inviteData.inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        questionnaireConfig: {
          ...(campaign.questionnaireConfig || {}),
          binomeEnabled: editForm.binomeEnabled,
          requireSameDepartment: editForm.requireSameDepartment
        }
      };
      const r = await fetch("/api/campaigns/" + id, { method: "PATCH", headers: { "Content-Type":"application/json" }, body: JSON.stringify(payload) });
      if (r.ok) { await loadCampaign(); setEditMode(false); }
    } finally { setSaving(false); }
  };

  if (loading) return (<><Navbar /><main className="page-main"><div style={{ textAlign:"center", padding:"80px 0", color:"var(--text-2)" }}>Chargement...</div></main></>);
  if (!campaign) return (<><Navbar /><main className="page-main"><div style={{ textAlign:"center", padding:"80px 0", color:"#f43f5e" }}>Campagne introuvable</div></main></>);

  const isPP = campaign.offer === "PREMIUM_PLUS";
  const globalScore = stats?.averages?.global ?? 0;
  const scoreColor = globalScore >= 80 ? "#34d399" : globalScore >= 60 ? "var(--primary)" : globalScore >= 40 ? "#f59e0b" : "#f43f5e";
  const radarData = stats?.averages ? Object.entries(DIMENSION_LABELS).map(([k,label]) => ({ dimension: label, score: (stats.averages as any)[k] ?? 0, fullMark: 100 })) : [];
  const icrData = stats?.icrDistribution ? [
    { name:"Faible", value:stats.icrDistribution.faible, color:ICR_COLORS[0] },
    { name:"Modéré", value:stats.icrDistribution.modere, color:ICR_COLORS[1] },
    { name:"Élevé",  value:stats.icrDistribution.eleve,  color:ICR_COLORS[2] },
    { name:"Critique",value:stats.icrDistribution.critique,color:ICR_COLORS[3] },
  ].filter(d => d.value > 0) : [];

  const TABS = [
    { key:"kit",           label:"Kit de déploiement", icon:QrCode },
    { key:"configuration", label:"Configuration",  icon:Settings },
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="page-container-wide" style={{ position:"relative", zIndex:1 }}>

          <Breadcrumb
            homeHref="/dashboard/b2b2c"
            items={[
              { label: "Portail Mutuelle", href: "/dashboard/b2b2c" },
              { label: "Campagnes", href: "/dashboard/b2b2c/campaigns" },
              { label: campaign.title },
            ]}
          />

          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:28 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
                <h1 style={{ fontFamily:"'Plus Jakarta Sans',Inter,sans-serif", fontWeight:800, fontSize:22, color:"var(--text-1)", margin:0 }}>{campaign.title}</h1>
                <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:700, background: isPP ? "rgba(245,158,11,0.15)" : "rgba(124,58,237,0.15)", color: isPP ? "#fbbf24" : "var(--primary)", border:"1px solid " + (isPP ? "rgba(245,158,11,0.3)" : "rgba(124,58,237,0.3)") }}>
                  {isPP ? <Crown size={10} /> : <Zap size={10} />} {isPP ? "PREMIUM+" : "PREMIUM"}
                </span>
                <span style={{ padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:600, background:"rgba(52,211,153,0.12)", color:"#34d399" }}>
                  {STATUS_LABELS[campaign.status] || campaign.status}
                </span>
              </div>
              <p style={{ color:"var(--text-2)", fontSize:13, margin:0 }}>
                <Calendar size={12} style={{ display:"inline", marginRight:4 }} />
                {new Date(campaign.startDate).toLocaleDateString("fr-FR")} — {new Date(campaign.endDate).toLocaleDateString("fr-FR")}
                {campaign.targetPopulation && <span style={{ marginLeft:12 }}><Users size={12} style={{ display:"inline", marginRight:4 }} />{campaign.targetPopulation} bénéficiaires</span>}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/dashboard/b2b2c?campaignId=${id}`} className="btn btn-secondary btn-sm" style={{ textDecoration:"none", flexShrink:0 }}>
                <BarChart3 size={14} /> Voir les statistiques
              </Link>
              {["CLOSED","RENOUVELEE"].includes(campaign.status) && (
                <Link href={"/dashboard/b2b2c/campaigns/" + id + "/renew"} className="btn btn-amber btn-sm" style={{ textDecoration:"none", flexShrink:0 }}>
                  Renouveler
                </Link>
              )}
            </div>
          </div>

          {/* Tab Bar */}
          <DashboardTabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as Tab)}
          />





          {/* TAB: Kit de Déploiement */}
          {activeTab === "kit" && (
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div className="card" style={{ maxWidth: 500, width: "100%" }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-1)", marginBottom:16 }}>Lien et QR Code d'accès</h2>
                <p style={{ fontSize:13, color:"var(--text-3)", marginBottom:20 }}>Distribuez ce code ou ce lien à vos bénéficiaires pour qu'ils puissent rejoindre la campagne B2B2C.</p>
                {inviteData ? (
                  <>
                    <div style={{ background:"var(--text-1)", borderRadius:14, padding:20, textAlign:"center", marginBottom:16 }}>
                      <img src={inviteData.qrCode} alt="QR Code" style={{ width:180, height:180, borderRadius:8, margin:"0 auto" }} />
                      <p style={{ color:"#1a0533", fontSize:14, marginTop:12, fontWeight:700 }}>Code de campagne : {inviteData.codeAccess}</p>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                      <Link2 size={16} style={{ color:"var(--text-2)", flexShrink:0 }} />
                      <span style={{ color:"var(--text-2)", fontSize:13, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inviteData.inviteUrl}</span>
                      <button onClick={copyLink} style={{ background:"none", border:"none", cursor:"pointer", color: copied ? "#34d399" : "var(--text-3)" }}>
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <button onClick={copyLink} className="btn btn-primary btn-md" style={{ width:"100%" }}>
                      {copied ? <><CheckCircle2 size={14} /> Copié !</> : <><Copy size={14} /> Copier le lien de déploiement</>}
                    </button>
                  </>
                ) : (
                  <button onClick={() => fetch("/api/b2b/invite?campaignId=" + id).then(r => r.ok ? r.json() : null).then(d => d && setInviteData(d))} className="btn btn-secondary btn-md" style={{ width:"100%" }}>
                    <QrCode size={14} /> Générer le Kit
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: Configuration */}
          {activeTab === "configuration" && (
            <div className="card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-1)" }}>Paramètres</h2>
                {!editMode
                  ? <button onClick={() => setEditMode(true)} className="btn btn-secondary btn-sm"><Settings size={13} /> Modifier</button>
                  : <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => setEditMode(false)} className="btn btn-ghost btn-sm">Annuler</button>
                      <button onClick={handleSaveEdit} disabled={saving} className="btn btn-primary btn-sm">{saving ? "Sauvegarde..." : "Sauvegarder"}</button>
                    </div>
                }
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div><label style={{ display:"block", fontSize:12, color:"var(--text-3)", fontWeight:600, marginBottom:6 }}>Nom</label>
                  {editMode ? <input className="input-field" value={editForm.title} onChange={e => setEditForm((f: any) => ({ ...f, title:e.target.value }))} /> : <p style={{ color:"var(--text-1)", fontSize:14 }}>{campaign.title}</p>}
                </div>
                <div><label style={{ display:"block", fontSize:12, color:"var(--text-3)", fontWeight:600, marginBottom:6 }}>Description</label>
                  {editMode ? <textarea className="input-field" style={{ minHeight:70, resize:"vertical" }} value={editForm.description} onChange={e => setEditForm((f: any) => ({ ...f, description:e.target.value }))} /> : <p style={{ color:"var(--text-3)", fontSize:14 }}>{campaign.description || "—"}</p>}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div><label style={{ display:"block", fontSize:12, color:"var(--text-3)", fontWeight:600, marginBottom:6 }}>Date de fin</label>
                    {editMode ? <input type="date" className="input-field" value={editForm.endDate} onChange={e => setEditForm((f: any) => ({ ...f, endDate:e.target.value }))} /> : <p style={{ color:"var(--text-1)", fontSize:14 }}>{new Date(campaign.endDate).toLocaleDateString("fr-FR")}</p>}
                  </div>
                  <div><label style={{ display:"block", fontSize:12, color:"var(--text-3)", fontWeight:600, marginBottom:6 }}>Statut</label>
                    {editMode ? (
                      <select className="input-field" value={editForm.status} onChange={e => setEditForm((f: any) => ({ ...f, status:e.target.value }))}>
                        {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v as string}</option>)}
                      </select>
                    ) : <p style={{ color:"#34d399", fontSize:14, fontWeight:600 }}>{STATUS_LABELS[campaign.status]}</p>}
                  </div>
                </div>
                
                {isPP && (
                  <>
                    <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.05)", margin: "8px 0" }} />
                    <h3 style={{ fontSize:15, fontWeight:700, color:"var(--primary)" }}>Règles du Binôme Relationnel</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: editMode ? "pointer" : "default" }}>
                        <input type="checkbox" checked={editForm.binomeEnabled} disabled={!editMode} onChange={e => setEditForm((f: any) => ({ ...f, binomeEnabled: e.target.checked }))} style={{ accentColor: "#7c3aed" }} />
                        <span style={{ fontSize: 13, color: "var(--text-1)" }}>Activer le module Binôme pour cette campagne</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: editMode ? "pointer" : "default" }}>
                        <input type="checkbox" checked={editForm.requireSameDepartment} disabled={!editMode} onChange={e => setEditForm((f: any) => ({ ...f, requireSameDepartment: e.target.checked }))} style={{ accentColor: "#7c3aed" }} />
                        <span style={{ fontSize: 13, color: "var(--text-1)" }}>Restreindre le matching au même département</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
