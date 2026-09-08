"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import {
  ArrowLeft, Users, BarChart3, Settings, Mail, RefreshCw, Target,
  Zap, Crown, CheckCircle2, Clock, Calendar, Copy, QrCode, Link2,
  Plus, TrendingUp, TrendingDown
} from "lucide-react";
import Link from "next/link";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend
} from "recharts";

type Tab = "participation" | "configuration" | "invitations" | "dashboard" | "plan";

const STATUS_LABELS: Record<string,string> = {
  DRAFT:"Brouillon", PLANIFIEE:"Planifiee", ACTIVE:"Active",
  EN_CLOTURE:"En cloture", CLOSED:"Cloturee", RENOUVELEE:"Renouvelee"
};
const ICR_COLORS = ["#34d399","#f59e0b","#f97316","#f43f5e"];
const DIMENSION_LABELS: Record<string,string> = {
  social:"Relations sociales", affective:"Relations affectives",
  sentimental:"Vie sentimentale", professional:"Vie pro", self:"Relation a soi"
};

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [activeTab, setActiveTab] = useState<Tab>("participation");
  const [campaign, setCampaign] = useState<any>(null);
  const [participation, setParticipation] = useState<any>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
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
        setEditForm({ title: d.campaign.title, description: d.campaign.description || "", endDate: d.campaign.endDate?.split("T")[0], status: d.campaign.status });
      }
      if ((r2 as any).ok) setStats(await (r2 as any).json());
    } finally { setLoading(false); }
  }, [id]);

  const loadInvites = useCallback(async () => {
    const r = await fetch("/api/campaigns/" + id + "/invites");
    if (r.ok) { const d = await r.json(); setInvites(d.invites || []); }
  }, [id]);

  useEffect(() => { loadCampaign(); }, [loadCampaign]);
  useEffect(() => { if (activeTab === "invitations") { loadInvites(); fetch("/api/b2b/invite?campaignId=" + id).then(r => r.ok ? r.json() : null).then(d => d && setInviteData(d)); } }, [activeTab, loadInvites, id]);
  useEffect(() => { if (activeTab === "plan") fetch("/api/actions").then(r => r.ok ? r.json() : []).then(setActions); }, [activeTab]);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/campaigns/" + id, { method: "PATCH", headers: { "Content-Type":"application/json" }, body: JSON.stringify(editForm) });
      if (r.ok) { await loadCampaign(); setEditMode(false); }
    } finally { setSaving(false); }
  };

  const handleAddInvites = async () => {
    const emails = emailsInput.split(/[\n,;]/).map((e: string) => e.trim()).filter((e: string) => e.includes("@"));
    if (!emails.length) return;
    setInviteLoading(true);
    try {
      const r = await fetch("/api/campaigns/" + id + "/invites", {
        method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ emails }),
      });
      if (r.ok) { const d = await r.json(); setInviteResult(d.results); setEmailsInput(""); loadInvites(); }
    } finally { setInviteLoading(false); }
  };

  const copyLink = () => {
    if (inviteData?.inviteUrl) { navigator.clipboard.writeText(inviteData.inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  if (loading) return (<><Navbar /><main className="page-main"><div style={{ textAlign:"center", padding:"80px 0", color:"#64748b" }}>Chargement...</div></main></>);
  if (!campaign) return (<><Navbar /><main className="page-main"><div style={{ textAlign:"center", padding:"80px 0", color:"#f43f5e" }}>Campagne introuvable</div></main></>);

  const isPP = campaign.offer === "PREMIUM_PLUS";
  const globalScore = stats?.averages?.global ?? 0;
  const scoreColor = globalScore >= 80 ? "#34d399" : globalScore >= 60 ? "#a78bfa" : globalScore >= 40 ? "#f59e0b" : "#f43f5e";
  const radarData = stats?.averages ? Object.entries(DIMENSION_LABELS).map(([k,label]) => ({ dimension: label, score: (stats.averages as any)[k] ?? 0, fullMark: 100 })) : [];
  const icrData = stats?.icrDistribution ? [
    { name:"Faible", value:stats.icrDistribution.faible, color:ICR_COLORS[0] },
    { name:"Modere", value:stats.icrDistribution.modere, color:ICR_COLORS[1] },
    { name:"Eleve",  value:stats.icrDistribution.eleve,  color:ICR_COLORS[2] },
    { name:"Critique",value:stats.icrDistribution.critique,color:ICR_COLORS[3] },
  ].filter(d => d.value > 0) : [];

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id:"participation", label:"Participation",  icon:Users },
    { id:"configuration", label:"Configuration",  icon:Settings },
    { id:"invitations",   label:"Invitations",    icon:Mail },
    { id:"dashboard",     label:"Dashboard IQRH", icon:BarChart3 },
    { id:"plan",          label:"Plan d action",  icon:Target },
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        <div className="page-container-wide" style={{ position:"relative", zIndex:1 }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:28 }}>
            <Link href="/dashboard/rh/campaigns" style={{ color:"#64748b", display:"flex", alignItems:"center", gap:4, textDecoration:"none", fontSize:13, flexShrink:0, marginTop:4 }}>
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
                {campaign.targetPopulation && <span style={{ marginLeft:12 }}><Users size={12} style={{ display:"inline", marginRight:4 }} />{campaign.targetPopulation} beneficiaires</span>}
              </p>
            </div>
            {["CLOSED","RENOUVELEE"].includes(campaign.status) && (
              <Link href={"/dashboard/rh/campaigns/" + id + "/renew"} className="btn btn-amber btn-sm" style={{ textDecoration:"none", flexShrink:0 }}>
                <RefreshCw size={13} /> Renouveler
              </Link>
            )}
          </div>

          {/* Tab Bar */}
          <div style={{ display:"flex", gap:4, marginBottom:28, background:"rgba(15,23,42,0.7)", padding:6, borderRadius:16, border:"1px solid rgba(255,255,255,0.06)", overflowX:"auto" }}>
            {TABS.map(({ id:tid, label, icon:Icon }) => {
              const isActive = activeTab === tid;
              return (
                <button key={tid} onClick={() => setActiveTab(tid)} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s", whiteSpace:"nowrap", flexShrink:0, background: isActive ? "rgba(124,58,237,0.15)" : "transparent", border:"1px solid " + (isActive ? "rgba(124,58,237,0.35)" : "transparent"), color: isActive ? "#a78bfa" : "#94a3b8" }}>
                  <Icon size={14} /> {label}
                </button>
              );
            })}
          </div>

          {/* TAB: Participation */}
          {activeTab === "participation" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
                {[
                  { label:"Invites",    value:participation?.invited    ?? 0, color:"#38bdf8", icon:Mail },
                  { label:"Actives",    value:participation?.activated  ?? 0, color:"#a78bfa", icon:CheckCircle2 },
                  { label:"Commences",  value:participation?.started    ?? 0, color:"#f59e0b", icon:Clock },
                  { label:"Termines",   value:participation?.completed  ?? 0, color:"#34d399", icon:CheckCircle2 },
                ].map(({ label, value, color, icon:Icon }) => (
                  <div key={label} className="card" style={{ textAlign:"center" }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <p style={{ fontSize:32, fontWeight:800, color, marginBottom:4 }}>{value}</p>
                    <p style={{ fontSize:12, color:"#64748b", fontWeight:600 }}>{label}</p>
                  </div>
                ))}
              </div>
              {(participation?.invited ?? 0) > 0 && (
                <div className="card">
                  <h3 style={{ fontSize:15, fontWeight:700, color:"#f8fafc", marginBottom:20 }}>Funnel de participation</h3>
                  {[
                    { label:"Invites",   value:participation.invited,   color:"#38bdf8" },
                    { label:"Actives",   value:participation.activated, color:"#a78bfa" },
                    { label:"Commences", value:participation.started,   color:"#f59e0b" },
                    { label:"Termines",  value:participation.completed, color:"#34d399" },
                  ].map(({ label, value, color }) => {
                    const pct = participation.invited > 0 ? Math.round(value / participation.invited * 100) : 0;
                    return (
                      <div key={label} style={{ marginBottom:14 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontSize:13, color:"#94a3b8" }}>{label}</span>
                          <span style={{ fontSize:13, fontWeight:700, color }}>{value} <span style={{ color:"#64748b", fontWeight:400 }}>({pct}%)</span></span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width:pct+"%", background:color }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: Configuration */}
          {activeTab === "configuration" && (
            <div className="card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc" }}>Parametres</h2>
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
                {campaign.parentCampaign && (
                  <div style={{ padding:"12px 16px", background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:12 }}>
                    <p style={{ fontSize:12, color:"#a78bfa", fontWeight:600, marginBottom:4 }}>Renouvellement de :</p>
                    <Link href={"/dashboard/rh/campaigns/" + campaign.parentCampaign.id} style={{ color:"#f8fafc", fontSize:14, textDecoration:"none" }}>{campaign.parentCampaign.title} ({campaign.parentCampaign.offer})</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Invitations */}
          {activeTab === "invitations" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div className="card">
                <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc", marginBottom:16 }}>Importer des beneficiaires</h2>
                <p style={{ fontSize:13, color:"#64748b", marginBottom:14, lineHeight:1.6 }}>Emails separes par des virgules, point-virgules ou retours a la ligne.</p>
                <textarea value={emailsInput} onChange={e => setEmailsInput(e.target.value)} placeholder={"jean.dupont@ent.com\nmarie.martin@ent.com"} className="input-field" style={{ minHeight:120, resize:"vertical", marginBottom:14, fontFamily:"monospace", fontSize:12 }} />
                {inviteResult && (
                  <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#34d399" }}>
                    <CheckCircle2 size={14} style={{ display:"inline", marginRight:6 }} />{inviteResult.created} ajoutes, {inviteResult.duplicates} doublons ignores
                  </div>
                )}
                <button onClick={handleAddInvites} disabled={inviteLoading || !emailsInput.trim()} className="btn btn-primary btn-md" style={{ width:"100%" }}>
                  {inviteLoading ? "Ajout..." : <><Plus size={14} /> Ajouter</>}
                </button>
              </div>
              <div className="card">
                <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc", marginBottom:16 }}>Lien et QR Code</h2>
                {inviteData ? (
                  <>
                    <div style={{ background:"#f8fafc", borderRadius:14, padding:20, textAlign:"center", marginBottom:16 }}>
                      <img src={inviteData.qrCode} alt="QR Code" style={{ width:160, height:160, borderRadius:8 }} />
                      <p style={{ color:"#1a0533", fontSize:12, marginTop:8, fontWeight:600 }}>Code : {inviteData.codeAccess}</p>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <Link2 size={13} style={{ color:"#64748b", flexShrink:0 }} />
                      <span style={{ color:"#94a3b8", fontSize:12, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inviteData.inviteUrl}</span>
                      <button onClick={copyLink} style={{ background:"none", border:"none", cursor:"pointer", color: copied ? "#34d399" : "#94a3b8" }}>
                        {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                    <button onClick={copyLink} className="btn btn-secondary btn-md" style={{ width:"100%" }}>
                      {copied ? <><CheckCircle2 size={13} /> Copie !</> : <><Copy size={13} /> Copier le lien</>}
                    </button>
                  </>
                ) : (
                  <button onClick={() => fetch("/api/b2b/invite?campaignId=" + id).then(r => r.ok ? r.json() : null).then(d => d && setInviteData(d))} className="btn btn-secondary btn-md" style={{ width:"100%" }}>
                    <QrCode size={14} /> Generer le QR Code
                  </button>
                )}
              </div>
              {invites.length > 0 && (
                <div className="card" style={{ gridColumn:"1 / -1" }}>
                  <h2 style={{ fontSize:15, fontWeight:700, color:"#f8fafc", marginBottom:16 }}>Beneficiaires invites ({invites.length})</h2>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                      <thead><tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                        {["Email","Statut","Invite le"].map(h => <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"#64748b", fontWeight:600, fontSize:11, textTransform:"uppercase" }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {invites.map((inv: any) => {
                          const sc: Record<string,string> = { INVITED:"#38bdf8", ACTIVATED:"#a78bfa", STARTED:"#f59e0b", COMPLETED:"#34d399" };
                          return (
                            <tr key={inv.id} className="table-row-hover" style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding:"10px 14px", color:"#cbd5e1" }}>{inv.email}</td>
                              <td style={{ padding:"10px 14px" }}><span style={{ padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:600, background:(sc[inv.status]||"#94a3b8")+"18", color:sc[inv.status]||"#94a3b8" }}>{inv.status}</span></td>
                              <td style={{ padding:"10px 14px", color:"#64748b" }}>{new Date(inv.invitedAt).toLocaleDateString("fr-FR")}</td>
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

          {/* TAB: Dashboard IQRH */}
          {activeTab === "dashboard" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {!stats || stats.anonymityBlocked ? (
                <div className="card" style={{ textAlign:"center", padding:"48px 32px" }}>
                  <div style={{ fontSize:44, marginBottom:14 }}>🔒</div>
                  <h2 style={{ color:"#f59e0b", fontWeight:700, fontSize:18, marginBottom:8 }}>Anonymat protege</h2>
                  <p style={{ color:"#94a3b8", fontSize:13, maxWidth:440, margin:"0 auto" }}>{stats?.message || "Minimum 5 evaluations completes requises."}</p>
                </div>
              ) : (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16 }}>
                    <div className="card" style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.08))", border:"1px solid rgba(124,58,237,0.25)" }}>
                      <p style={{ color:"#94a3b8", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Score IQRH moyen</p>
                      <p style={{ fontSize:44, fontWeight:800, color:scoreColor, lineHeight:1 }}>{globalScore}<span style={{ fontSize:16, color:"#475569" }}>/100</span></p>
                      <p style={{ color:"#64748b", fontSize:12, marginTop:6 }}>{stats.respondentCount} repondants</p>
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
                    <div className="card">
                      <h3 style={{ fontSize:14, fontWeight:600, color:"#f8fafc", marginBottom:14 }}>Radar Relationnel</h3>
                      <div style={{ height:240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}><PolarGrid stroke="rgba(255,255,255,0.06)" /><PolarAngleAxis dataKey="dimension" tick={{ fontSize:10, fill:"#64748b" }} /><Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} /></RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {icrData.length > 0 && (
                      <div className="card">
                        <h3 style={{ fontSize:14, fontWeight:600, color:"#f8fafc", marginBottom:14 }}>Repartition ICR</h3>
                        <div style={{ height:240 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart><Pie data={icrData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => name + " " + Math.round((percent||0)*100) + "%"} labelLine={false}>{icrData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ background:"#111827", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8 }} /><Legend /></PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    {stats.topRiskFactors?.length > 0 && (
                      <div className="card">
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}><TrendingDown size={15} style={{ color:"#f43f5e" }} /><h3 style={{ fontSize:14, fontWeight:600, color:"#f8fafc" }}>Facteurs de Risque</h3></div>
                        {stats.topRiskFactors.slice(0,6).map((f: any, i: number) => (
                          <div key={i} style={{ marginBottom:10 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}><span style={{ color:"#94a3b8", fontSize:12 }}>{f.label}</span><span style={{ color:"#f43f5e", fontSize:11, fontWeight:600 }}>{f.pct}%</span></div>
                            <div className="progress-bar"><div className="progress-fill" style={{ width:f.pct+"%", background:"#f43f5e" }} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {stats.topProtectiveFactors?.length > 0 && (
                      <div className="card">
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}><TrendingUp size={15} style={{ color:"#34d399" }} /><h3 style={{ fontSize:14, fontWeight:600, color:"#f8fafc" }}>Facteurs Protecteurs</h3></div>
                        {stats.topProtectiveFactors.slice(0,6).map((f: any, i: number) => (
                          <div key={i} style={{ marginBottom:10 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}><span style={{ color:"#94a3b8", fontSize:12 }}>{f.label}</span><span style={{ color:"#34d399", fontSize:11, fontWeight:600 }}>{f.pct}%</span></div>
                            <div className="progress-bar"><div className="progress-fill" style={{ width:f.pct+"%", background:"#34d399" }} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: Plan */}
          {activeTab === "plan" && (
            <div className="card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc" }}>Plan d action</h2>
                <Link href="/dashboard/actions" className="btn btn-primary btn-sm" style={{ textDecoration:"none" }}><Plus size={13} /> Gerer le plan</Link>
              </div>
              {actions.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px 0", color:"#475569" }}><Target size={28} style={{ marginBottom:10, opacity:0.3 }} /><p style={{ fontSize:13 }}>Aucune action. Cliquez sur "Gerer le plan" pour en creer.</p></div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {actions.map((a: any) => {
                    const sc: Record<string,string> = { PROPOSEE:"#94a3b8", VALIDEE:"#a78bfa", PLANIFIEE:"#f59e0b", EN_COURS:"#38bdf8", REALISEE:"#34d399" };
                    const sl: Record<string,string> = { PROPOSEE:"Proposee", VALIDEE:"Validee", PLANIFIEE:"Planifiee", EN_COURS:"En cours", REALISEE:"Realisee" };
                    const color = sc[a.status] || "#94a3b8";
                    return (
                      <div key={a.id} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"12px 16px", background:"rgba(255,255,255,0.025)", borderRadius:12, border:"1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:color, marginTop:6, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                            <span style={{ fontSize:14, fontWeight:600, color:"#f8fafc" }}>{a.title}</span>
                            <span style={{ padding:"1px 8px", borderRadius:999, fontSize:10, fontWeight:600, background:color+"18", color }}>{sl[a.status]}</span>
                          </div>
                          {a.description && <p style={{ fontSize:12, color:"#64748b", margin:0 }}>{a.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  );
}