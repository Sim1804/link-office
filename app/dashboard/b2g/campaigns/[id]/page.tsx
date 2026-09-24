"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  Users, BarChart3, Settings, Mail, RefreshCw, Target,
  Zap, Crown, CheckCircle2, Clock, Calendar, Copy, QrCode, Link2,
  Plus, TrendingUp, Download, Trash2, MapPin
} from "lucide-react";
import Link from "next/link";
import { DashboardTabs } from "@/components/ui/DashboardTabs";

type Tab = "participation" | "kit" | "configuration";

const STATUS_LABELS: Record<string,string> = {
  DRAFT:"Brouillon", PLANIFIEE:"Planifiée", ACTIVE:"Active",
  EN_CLOTURE:"En clôture", CLOSED:"Clôturée", RENOUVELEE:"Renouvelée"
};

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("participation");
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
          endDate: d.campaign.endDate?.split("T")[0], 
          status: d.campaign.status 
        });
      }
      if ((r2 as any).ok) {
        const d = await (r2 as any).json();
        setStats(d);
        setParticipation(d.participation);
      }
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadCampaign(); }, [loadCampaign]);
  useEffect(() => { 
    if (activeTab === "kit") { 
      fetch("/api/b2b/invite?campaignId=" + id).then(r => r.ok ? r.json() : null).then(d => d && setInviteData(d)); 
    } 
  }, [activeTab, id]);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/campaigns/" + id, { method: "PATCH", headers: { "Content-Type":"application/json" }, body: JSON.stringify(editForm) });
      if (r.ok) { await loadCampaign(); setEditMode(false); }
    } finally { setSaving(false); }
  };

  const copyLink = () => {
    if (inviteData?.inviteUrl) { navigator.clipboard.writeText(inviteData.inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  if (loading) return (<><Navbar /><main className="page-main"><div style={{ textAlign:"center", padding:"80px 0", color:"var(--text-2)" }}>Chargement...</div></main></>);
  if (!campaign) return (<><Navbar /><main className="page-main"><div style={{ textAlign:"center", padding:"80px 0", color:"#f43f5e" }}>Campagne introuvable</div></main></>);

  const isPP = campaign.offer === "PREMIUM_PLUS";

  const TABS = [
    { key:"participation", label:"Participation",  icon:Users },
    { key:"kit",           label:"Kit de Déploiement", icon:QrCode },
    { key:"configuration", label:"Paramètres",     icon:Settings },
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="page-container-wide" style={{ position:"relative", zIndex:1 }}>

          <Breadcrumb
            homeHref="/dashboard/b2g"
            items={[
              { label: "Observatoire Territoire", href: "/dashboard/b2g" },
              { label: "Campagnes", href: "/dashboard/b2g/campaigns" },
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
                {campaign.territory && <span style={{ marginRight:12 }}><MapPin size={12} style={{ display:"inline", marginRight:4 }} />{campaign.territory}</span>}
                <Calendar size={12} style={{ display:"inline", marginRight:4 }} />
                {new Date(campaign.startDate).toLocaleDateString("fr-FR")} — {new Date(campaign.endDate).toLocaleDateString("fr-FR")}
                {campaign.targetPopulation && <span style={{ marginLeft:12 }}><Users size={12} style={{ display:"inline", marginRight:4 }} />{campaign.targetPopulation.toLocaleString("fr-FR")} citoyens cible</span>}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/dashboard/b2g?campaignId=${id}`} className="btn btn-secondary btn-sm" style={{ textDecoration:"none", flexShrink:0 }}>
                <BarChart3 size={14} /> Voir l'observatoire
              </Link>
              {["CLOSED","RENOUVELEE"].includes(campaign.status) && (
                <Link href={"/dashboard/b2g/campaigns/" + id + "/renew"} className="btn btn-amber btn-sm" style={{ textDecoration:"none", flexShrink:0 }}>
                  <RefreshCw size={13} /> Renouveler
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

          {/* TAB: Participation */}
          {activeTab === "participation" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
                {[
                  { label:"Invités/Sensibilisés", value:participation?.invited    ?? 0, color:"#38bdf8", icon:Mail },
                  { label:"Actives",              value:participation?.activated  ?? 0, color:"var(--primary)", icon:CheckCircle2 },
                  { label:"Commencés",            value:participation?.started    ?? 0, color:"#f59e0b", icon:Clock },
                  { label:"Terminés",             value:participation?.completed  ?? 0, color:"#34d399", icon:CheckCircle2 },
                ].map(({ label, value, color, icon:Icon }) => (
                  <div key={label} className="card" style={{ textAlign:"center" }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <p style={{ fontSize:32, fontWeight:800, color, marginBottom:4 }}>{value}</p>
                    <p style={{ fontSize:12, color:"var(--text-2)", fontWeight:600 }}>{label}</p>
                  </div>
                ))}
              </div>
              
              {/* Barre objectif */}
              {campaign?.targetPopulation && (
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}>Objectif de participation territoriale</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
                      {participation?.completed ?? 0} / {campaign.targetPopulation.toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, Math.round(((participation?.completed ?? 0) / campaign.targetPopulation) * 100))}%`, borderRadius: 999, background: "linear-gradient(90deg, #06b6d4, #34d399)", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Kit de Déploiement */}
          {activeTab === "kit" && (
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div className="card" style={{ maxWidth: 500, width: "100%" }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-1)", marginBottom:16 }}>Lien et QR Code d'accès</h2>
                <p style={{ fontSize:13, color:"var(--text-3)", marginBottom:20 }}>Affichez ce QR Code ou distribuez ce lien pour que les citoyens de la collectivité puissent participer à l'évaluation.</p>
                {inviteData ? (
                  <>
                    <div style={{ background:"var(--text-1)", borderRadius:14, padding:20, textAlign:"center", marginBottom:16 }}>
                      <img src={inviteData.qrCode} alt="QR Code" style={{ width:180, height:180, borderRadius:8, margin:"0 auto" }} />
                      <p style={{ color:"#1a0533", fontSize:14, marginTop:12, fontWeight:700 }}>Code d'accès : {inviteData.codeAccess}</p>
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
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
