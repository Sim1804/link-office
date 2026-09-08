"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, BarChart3, Target, CheckCircle2, Copy, QrCode, Link2, Zap, Crown, Calendar, Users, Settings } from "lucide-react";
import Link from "next/link";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Tab = "dashboard" | "plan" | "kit" | "configuration";

const STATUS_LABELS: Record<string,string> = { DRAFT:"Brouillon", PLANIFIEE:"Planifiée", ACTIVE:"Active", EN_CLOTURE:"En clôture", CLOSED:"Clôturée", RENOUVELEE:"Renouvelée" };
const ICR_COLORS = ["#34d399","#f59e0b","#f97316","#f43f5e"];
const DIMENSION_LABELS: Record<string,string> = { social:"Relations sociales", affective:"Relations affectives", sentimental:"Vie sentimentale", professional:"Vie pro", self:"Relation à soi" };

export default function PartnerCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [campaign, setCampaign] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
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
        });
      }
      if ((r2 as any).ok) setStats(await (r2 as any).json());
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadCampaign(); }, [loadCampaign]);
  useEffect(() => { if (activeTab === "kit") fetch("/api/b2b/invite?campaignId=" + id).then(r => r.ok ? r.json() : null).then(d => d && setInviteData(d)); }, [activeTab, id]);
  useEffect(() => { if (activeTab === "plan") fetch("/api/actions").then(r => r.ok ? r.json() : []).then(setActions); }, [activeTab]);

  const copyLink = () => {
    if (inviteData?.inviteUrl) { navigator.clipboard.writeText(inviteData.inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/campaigns/" + id, { method: "PATCH", headers: { "Content-Type":"application/json" }, body: JSON.stringify(editForm) });
      if (r.ok) { await loadCampaign(); setEditMode(false); }
    } finally { setSaving(false); }
  };

  if (loading) return (<><Navbar /><main className="page-main"><div style={{ textAlign:"center", padding:"80px 0", color:"#64748b" }}>Chargement...</div></main></>);
  if (!campaign) return (<><Navbar /><main className="page-main"><div style={{ textAlign:"center", padding:"80px 0", color:"#f43f5e" }}>Campagne introuvable</div></main></>);

  const isPP = campaign.offer === "PREMIUM_PLUS";
  const globalScore = stats?.averages?.global ?? 0;
  const scoreColor = globalScore >= 80 ? "#34d399" : globalScore >= 60 ? "#a78bfa" : globalScore >= 40 ? "#f59e0b" : "#f43f5e";
  const radarData = stats?.averages ? Object.entries(DIMENSION_LABELS).map(([k,label]) => ({ dimension: label, score: (stats.averages as any)[k] ?? 0, fullMark: 100 })) : [];
  const icrData = stats?.icrDistribution ? [
    { name:"Faible", value:stats.icrDistribution.faible, color:ICR_COLORS[0] },
    { name:"Modéré", value:stats.icrDistribution.modere, color:ICR_COLORS[1] },
    { name:"Élevé",  value:stats.icrDistribution.eleve,  color:ICR_COLORS[2] },
    { name:"Critique",value:stats.icrDistribution.critique,color:ICR_COLORS[3] },
  ].filter(d => d.value > 0) : [];

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id:"dashboard",     label:"Dashboard IQRH", icon:BarChart3 },
    { id:"plan",          label:"Recommandations",  icon:Target },
    { id:"kit",           label:"Kit de déploiement", icon:QrCode },
    { id:"configuration", label:"Configuration",  icon:Settings },
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" style={{ background: "rgba(16,185,129,0.1)" }} />
        <div className="blob-cyan" style={{ background: "rgba(124,58,237,0.1)" }} />
        <div className="page-container-wide" style={{ position:"relative", zIndex:1 }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:28 }}>
            <Link href="/dashboard/b2b2c/campaigns" style={{ color:"#64748b", display:"flex", alignItems:"center", gap:4, textDecoration:"none", fontSize:13, flexShrink:0, marginTop:4 }}>
              <ArrowLeft size={15} /> Campagnes
            </Link>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
                <h1 style={{ fontFamily:"'Plus Jakarta Sans',Inter,sans-serif", fontWeight:800, fontSize:22, color:"#f8fafc", margin:0 }}>{campaign.title}</h1>
                <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:700, background: isPP ? "rgba(245,158,11,0.15)" : "rgba(124,58,237,0.15)", color: isPP ? "#fbbf24" : "#a78bfa", border:"1px solid " + (isPP ? "rgba(245,158,11,0.3)" : "rgba(124,58,237,0.3)") }}>
                  {isPP ? <Crown size={10} /> : <Zap size={10} />} {isPP ? "PREMIUM+" : "PREMIUM"}
                </span>
                <span style={{ padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:600, background:"rgba(52,211,153,0.12)", color:"#34d399" }}>
                  {STATUS_LABELS[campaign.status] || campaign.status}
                </span>
              </div>
              <p style={{ color:"#64748b", fontSize:13, margin:0 }}>
                <Calendar size={12} style={{ display:"inline", marginRight:4 }} />
                {new Date(campaign.startDate).toLocaleDateString("fr-FR")} — {new Date(campaign.endDate).toLocaleDateString("fr-FR")}
                {campaign.targetPopulation && <span style={{ marginLeft:12 }}><Users size={12} style={{ display:"inline", marginRight:4 }} />{campaign.targetPopulation} bénéficiaires</span>}
              </p>
            </div>
            {["CLOSED","RENOUVELEE"].includes(campaign.status) && (
              <Link href={"/dashboard/b2b2c/campaigns/" + id + "/renew"} className="btn btn-amber btn-sm" style={{ textDecoration:"none", flexShrink:0 }}>
                Renouveler
              </Link>
            )}
          </div>

          {/* Tab Bar */}
          <div style={{ display:"flex", gap:4, marginBottom:28, background:"rgba(15,23,42,0.7)", padding:6, borderRadius:16, border:"1px solid rgba(255,255,255,0.06)", overflowX:"auto" }}>
            {TABS.map(({ id:tid, label, icon:Icon }) => {
              const isActive = activeTab === tid;
              return (
                <button key={tid} onClick={() => setActiveTab(tid)} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s", whiteSpace:"nowrap", flexShrink:0, background: isActive ? "rgba(16,185,129,0.15)" : "transparent", border:"1px solid " + (isActive ? "rgba(16,185,129,0.35)" : "transparent"), color: isActive ? "#34d399" : "#94a3b8" }}>
                  <Icon size={14} /> {label}
                </button>
              );
            })}
          </div>

          {/* TAB: Dashboard IQRH */}
          {activeTab === "dashboard" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {!stats || stats.anonymityBlocked ? (
                <div className="card" style={{ textAlign:"center", padding:"48px 32px" }}>
                  <div style={{ fontSize:44, marginBottom:14 }}>🔒</div>
                  <h2 style={{ color:"#f59e0b", fontWeight:700, fontSize:18, marginBottom:8 }}>Anonymat protégé</h2>
                  <p style={{ color:"#94a3b8", fontSize:13, maxWidth:440, margin:"0 auto" }}>{stats?.message || "Minimum 5 évaluations complètes requises."}</p>
                </div>
              ) : (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16 }}>
                    <div className="card" style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.08))", border:"1px solid rgba(16,185,129,0.25)" }}>
                      <p style={{ color:"#94a3b8", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Score IQRH moyen</p>
                      <p style={{ fontSize:44, fontWeight:800, color:scoreColor, lineHeight:1 }}>{globalScore}<span style={{ fontSize:16, color:"#475569" }}>/100</span></p>
                      <p style={{ color:"#64748b", fontSize:12, marginTop:6 }}>{stats.respondentCount} répondants</p>
                    </div>
                    {Object.entries(DIMENSION_LABELS).map(([k, label]) => {
                      const score = (stats.averages as any)?.[k] ?? 0;
                      const c = score >= 70 ? "#34d399" : score >= 50 ? "#a78bfa" : "#f59e0b";
                      return (
                        <div key={k} className="card">
                          <p style={{ fontSize:11, color:"#64748b", marginBottom:6 }}>{label as string}</p>
                          <p style={{ fontSize:24, fontWeight:700, color:c }}>{score}<span style={{ fontSize:11, color:"#475569" }}>/100</span></p>
                          <div className="progress-bar" style={{ marginTop:8 }}><div className="progress-fill" style={{ width:score+"%", background:c }} /></div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                    <div className="card" style={{ minHeight:300 }}>
                      <h3 style={{ fontSize:15, fontWeight:700, color:"#f8fafc", marginBottom:20 }}>Équilibre des Dimensions</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="dimension" tick={{ fill:"#94a3b8", fontSize:11 }} />
                          <Radar name="IQRH" dataKey="score" stroke="#34d399" fill="#34d399" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="card" style={{ minHeight:300 }}>
                      <h3 style={{ fontSize:15, fontWeight:700, color:"#f8fafc", marginBottom:20 }}>Indice de Capital Relationnel (ICR)</h3>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={icrData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                            {icrData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8 }} itemStyle={{ color:"#f8fafc", fontWeight:600 }} />
                          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize:12, paddingTop:20 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: Plan d'action */}
          {activeTab === "plan" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div className="card" style={{ background:"linear-gradient(to right, rgba(16,185,129,0.1), transparent)" }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc", marginBottom:8 }}>Recommandations Collectives</h2>
                <p style={{ color:"#94a3b8", fontSize:14 }}>Actions suggérées en fonction des résultats agrégés de vos bénéficiaires pour améliorer la santé relationnelle globale.</p>
              </div>
              {actions.length === 0 ? <p style={{ color:"#64748b", padding:"40px 0", textAlign:"center" }}>Aucune recommandation disponible pour le moment.</p> : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:16 }}>
                  {actions.map((act: any) => (
                    <div key={act.id} className="card">
                      <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:"rgba(16,185,129,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#34d399", flexShrink:0 }}>
                          <Target size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize:15, fontWeight:700, color:"#f8fafc", marginBottom:4 }}>{act.title}</h3>
                          <p style={{ fontSize:13, color:"#94a3b8", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{act.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Kit de Déploiement */}
          {activeTab === "kit" && (
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div className="card" style={{ maxWidth: 500, width: "100%" }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc", marginBottom:16 }}>Lien et QR Code d'accès</h2>
                <p style={{ fontSize:13, color:"#94a3b8", marginBottom:20 }}>Distribuez ce code ou ce lien à vos bénéficiaires pour qu'ils puissent rejoindre la campagne B2B2C.</p>
                {inviteData ? (
                  <>
                    <div style={{ background:"#f8fafc", borderRadius:14, padding:20, textAlign:"center", marginBottom:16 }}>
                      <img src={inviteData.qrCode} alt="QR Code" style={{ width:180, height:180, borderRadius:8, margin:"0 auto" }} />
                      <p style={{ color:"#1a0533", fontSize:14, marginTop:12, fontWeight:700 }}>Code de campagne : {inviteData.codeAccess}</p>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                      <Link2 size={16} style={{ color:"#64748b", flexShrink:0 }} />
                      <span style={{ color:"#e2e8f0", fontSize:13, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inviteData.inviteUrl}</span>
                      <button onClick={copyLink} style={{ background:"none", border:"none", cursor:"pointer", color: copied ? "#34d399" : "#94a3b8" }}>
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
                <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc" }}>Paramètres</h2>
                {!editMode
                  ? <button onClick={() => setEditMode(true)} className="btn btn-secondary btn-sm"><Settings size={13} /> Modifier</button>
                  : <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => setEditMode(false)} className="btn btn-ghost btn-sm">Annuler</button>
                      <button onClick={handleSaveEdit} disabled={saving} className="btn btn-primary btn-sm">{saving ? "Sauvegarde..." : "Sauvegarder"}</button>
                    </div>
                }
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div><label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:6 }}>Nom</label>
                  {editMode ? <input className="input-field" value={editForm.title} onChange={e => setEditForm((f: any) => ({ ...f, title:e.target.value }))} /> : <p style={{ color:"#f8fafc", fontSize:14 }}>{campaign.title}</p>}
                </div>
                <div><label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:6 }}>Description</label>
                  {editMode ? <textarea className="input-field" style={{ minHeight:70, resize:"vertical" }} value={editForm.description} onChange={e => setEditForm((f: any) => ({ ...f, description:e.target.value }))} /> : <p style={{ color:"#94a3b8", fontSize:14 }}>{campaign.description || "—"}</p>}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div><label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:6 }}>Date de fin</label>
                    {editMode ? <input type="date" className="input-field" value={editForm.endDate} onChange={e => setEditForm((f: any) => ({ ...f, endDate:e.target.value }))} /> : <p style={{ color:"#f8fafc", fontSize:14 }}>{new Date(campaign.endDate).toLocaleDateString("fr-FR")}</p>}
                  </div>
                  <div><label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:6 }}>Statut</label>
                    {editMode ? (
                      <select className="input-field" value={editForm.status} onChange={e => setEditForm((f: any) => ({ ...f, status:e.target.value }))}>
                        {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v as string}</option>)}
                      </select>
                    ) : <p style={{ color:"#34d399", fontSize:14, fontWeight:600 }}>{STATUS_LABELS[campaign.status]}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
