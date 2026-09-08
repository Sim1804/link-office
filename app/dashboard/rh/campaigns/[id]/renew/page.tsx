"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, RefreshCw, Zap, Crown, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RenewCampaignPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    offer: "" as "PREMIUM" | "PREMIUM_PLUS" | "",
    startDate: "",
    endDate: "",
    targetPopulation: "",
  });

  useEffect(() => {
    fetch("/api/campaigns/" + id)
      .then(r => r.json())
      .then(d => {
        if (d.campaign) {
          const c = d.campaign;
          setParent(c);
          setForm(f => ({
            ...f,
            title: c.title + " — Renouvellement",
            offer: c.offer,
            targetPopulation: c.targetPopulation?.toString() || "",
          }));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRenew = async () => {
    if (!form.offer || !form.title || !form.startDate || !form.endDate) {
      setError("Tous les champs obligatoires doivent etre remplis."); return;
    }
    setSaving(true); setError(null);
    try {
      const r = await fetch("/api/campaigns/" + id + "/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Erreur renouvellement");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/rh/campaigns/" + data.campaign.id), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const offerChanged = parent && form.offer && form.offer !== parent.offer;
  const toPlus = offerChanged && form.offer === "PREMIUM_PLUS";
  const fromPlus = offerChanged && parent.offer === "PREMIUM_PLUS" && form.offer === "PREMIUM";

  if (loading) return (<><Navbar /><main className="page-main"><div style={{ textAlign:"center", padding:"80px 0", color:"#64748b" }}>Chargement...</div></main></>);

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" /><div className="blob-cyan" />
        <div style={{ maxWidth:700, margin:"0 auto", position:"relative", zIndex:1 }}>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <Link href={"/dashboard/rh/campaigns/" + id} style={{ color:"#64748b", display:"flex", alignItems:"center", gap:4, textDecoration:"none", fontSize:13 }}>
              <ArrowLeft size={15} /> Retour a la campagne
            </Link>
          </div>

          <div style={{ marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <RefreshCw size={20} style={{ color:"#a78bfa" }} />
              <h1 style={{ fontFamily:"'Plus Jakarta Sans',Inter,sans-serif", fontWeight:800, fontSize:24, color:"#f8fafc" }}>Renouveler la campagne</h1>
            </div>
            {parent && (
              <p style={{ color:"#64748b", fontSize:14 }}>
                Renouvellement de : <strong style={{ color:"#94a3b8" }}>{parent.title}</strong> ({parent.offer})
              </p>
            )}
          </div>

          {success ? (
            <div className="card" style={{ textAlign:"center", padding:"40px 32px" }}>
              <CheckCircle2 size={48} style={{ color:"#34d399", marginBottom:16 }} />
              <h2 style={{ color:"#f8fafc", fontWeight:700, fontSize:18, marginBottom:8 }}>Campagne renouvelee !</h2>
              <p style={{ color:"#64748b", fontSize:14 }}>Redirection en cours...</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {/* Choix offre */}
              <div className="card">
                <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc", marginBottom:16 }}>Offre pour la nouvelle periode</h2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {[
                    { id:"PREMIUM", icon:Zap, color:"#a78bfa", border:"#7c3aed", title:"PREMIUM", sub:"Parcours complet sans module Binome" },
                    { id:"PREMIUM_PLUS", icon:Crown, color:"#fbbf24", border:"#f59e0b", title:"PREMIUM+", sub:"Tout PREMIUM + module Binome Relationnel" },
                  ].map(plan => {
                    const isSelected = form.offer === plan.id;
                    const Icon = plan.icon;
                    return (
                      <div key={plan.id} onClick={() => setForm(f => ({ ...f, offer: plan.id as any }))} style={{ cursor:"pointer", padding:"16px 20px", borderRadius:14, border:"1px solid " + (isSelected ? plan.border+"80" : "rgba(255,255,255,0.08)"), background: isSelected ? plan.color+"12" : "rgba(255,255,255,0.02)", transition:"all 0.2s", outline: isSelected ? "2px solid " + plan.border + "50" : "none", outlineOffset:2 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                          <Icon size={18} style={{ color:plan.color }} />
                          <span style={{ fontSize:15, fontWeight:700, color:"#f8fafc" }}>{plan.title}</span>
                          {isSelected && <span style={{ marginLeft:"auto", width:18, height:18, borderRadius:"50%", background:plan.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#0b0f19" }}>✓</span>}
                        </div>
                        <p style={{ fontSize:12, color:"#64748b" }}>{plan.sub}</p>
                      </div>
                    );
                  })}
                </div>
                {toPlus && (
                  <div style={{ marginTop:14, padding:"12px 16px", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, fontSize:13, color:"#fbbf24", display:"flex", alignItems:"flex-start", gap:8 }}>
                    <CheckCircle2 size={14} style={{ marginTop:2, flexShrink:0 }} />
                    Le module Binome Relationnel sera active pour cette nouvelle campagne.
                  </div>
                )}
                {fromPlus && (
                  <div style={{ marginTop:14, padding:"12px 16px", background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:12, fontSize:13, color:"#f43f5e", display:"flex", alignItems:"flex-start", gap:8 }}>
                    <AlertTriangle size={14} style={{ marginTop:2, flexShrink:0 }} />
                    Le module Binome sera desactive pour cette nouvelle campagne. L historique des binomes precedents est conserve.
                  </div>
                )}
              </div>

              {/* Parametres */}
              <div className="card">
                <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc", marginBottom:20 }}>Parametres de la nouvelle campagne</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div><label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:6 }}>Nom *</label>
                    <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="Titre de la nouvelle campagne" />
                  </div>
                  <div><label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:6 }}>Description</label>
                    <textarea className="input-field" style={{ minHeight:70, resize:"vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <div><label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:6 }}>Date de debut *</label>
                      <input type="date" className="input-field" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate:e.target.value }))} />
                    </div>
                    <div><label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:6 }}>Date de fin *</label>
                      <input type="date" className="input-field" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate:e.target.value }))} />
                    </div>
                  </div>
                  <div><label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:6 }}>Population cible</label>
                    <input type="number" className="input-field" value={form.targetPopulation} onChange={e => setForm(f => ({ ...f, targetPopulation:e.target.value }))} placeholder="Ex: 200" />
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ display:"flex", alignItems:"center", gap:8, color:"#f43f5e", fontSize:13, padding:"10px 16px", background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:10 }}>
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button onClick={handleRenew} disabled={saving} className="btn btn-primary btn-lg">
                  {saving ? "Creation en cours..." : <><RefreshCw size={15} /> Creer la nouvelle campagne</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}