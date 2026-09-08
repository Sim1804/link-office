"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Zap, Crown, Calendar, Users, ChevronRight, CheckCircle2, Clock, Archive, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  offer: "PREMIUM" | "PREMIUM_PLUS";
  status: string;
  startDate: string;
  endDate: string;
  targetPopulation: number | null;
  _count: { assessments: number; users: number; invites: number };
  snapshot: { createdAt: string } | null;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT:       { label: "Brouillon",   color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: Clock },
  PLANIFIEE:   { label: "Planifiée",   color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  icon: Calendar },
  ACTIVE:      { label: "Active",      color: "#34d399", bg: "rgba(52,211,153,0.12)",  icon: CheckCircle2 },
  EN_CLOTURE:  { label: "En clôture", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  CLOSED:      { label: "Clôturée",   color: "#f43f5e", bg: "rgba(244,63,94,0.12)",   icon: Archive },
  RENOUVELEE:  { label: "Renouvelée", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: RefreshCw },
};

export default function PartnerCampaignsListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then(r => r.json())
      .then(d => { if (d.campaigns) setCampaigns(d.campaigns); })
      .finally(() => setLoading(false));
  }, []);

  const activeCampaigns  = campaigns.filter(c => ["ACTIVE","EN_CLOTURE"].includes(c.status));
  const plannedCampaigns = campaigns.filter(c => c.status === "PLANIFIEE" || c.status === "DRAFT");
  const closedCampaigns  = campaigns.filter(c => ["CLOSED","RENOUVELEE"].includes(c.status));

  const CampaignCard = ({ c }: { c: Campaign }) => {
    const meta   = STATUS_META[c.status] || STATUS_META.DRAFT;
    const Icon   = meta.icon;
    const isPP   = c.offer === "PREMIUM_PLUS";
    const endDate = new Date(c.endDate);
    const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / 86400000);
    const completion = c._count.invites > 0 ? Math.round((c._count.assessments / c._count.invites) * 100) : 0;

    return (
      <Link href={`/dashboard/b2b2c/campaigns/${c.id}`} style={{ textDecoration: "none" }}>
        <div className="card card-hover" style={{ cursor: "pointer", transition: "all 0.25s" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", margin: 0 }}>{c.title}</h3>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px",
                  borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: isPP ? "rgba(245,158,11,0.15)" : "rgba(124,58,237,0.15)",
                  color: isPP ? "#fbbf24" : "#a78bfa",
                  border: `1px solid ${isPP ? "rgba(245,158,11,0.3)" : "rgba(124,58,237,0.3)"}`,
                }}>
                  {isPP ? <Crown size={10} /> : <Zap size={10} />}
                  {isPP ? "PREMIUM+" : "PREMIUM"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: meta.bg, color: meta.color }}>
                  <Icon size={10} /> {meta.label}
                </span>
              </div>
              {c.description && <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{c.description}</p>}
            </div>
            <ChevronRight size={16} style={{ color: "#475569", flexShrink: 0, marginLeft: 8 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Invités</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>{c._count.invites}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Complétées</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#34d399" }}>{c._count.assessments}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Taux</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: completion >= 70 ? "#34d399" : completion >= 40 ? "#f59e0b" : "#f43f5e" }}>{completion}%</p>
            </div>
          </div>

          {completion > 0 && (
            <div className="progress-bar" style={{ marginBottom: 12 }}>
              <div className="progress-fill" style={{ width: `${completion}%`, background: completion >= 70 ? "#34d399" : completion >= 40 ? "#f59e0b" : "#f43f5e" }} />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={11} />
              {new Date(c.startDate).toLocaleDateString("fr-FR")} — {new Date(c.endDate).toLocaleDateString("fr-FR")}
            </span>
            {c.status === "ACTIVE" && daysLeft > 0 && (
              <span style={{ color: daysLeft <= 30 ? "#f59e0b" : "#64748b" }}>
                {daysLeft} j restants
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" style={{ background: "rgba(16,185,129,0.1)" }} />
        <div className="blob-cyan" style={{ background: "rgba(124,58,237,0.1)" }} />
        <div className="page-container-wide" style={{ position: "relative", zIndex: 1 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={24} style={{ color: "#34d399" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans',Inter,sans-serif", fontWeight: 800, fontSize: 26, color: "#f8fafc", letterSpacing: "-0.02em" }}>
                Campagnes Partenaire
              </h1>
              <p style={{ color: "#64748b", fontSize: 14 }}>Suivez le déploiement chez vos bénéficiaires</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <Link href="/dashboard/b2b2c" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>
                Vue d'ensemble B2B2C
              </Link>
              <Link href="/dashboard/b2b2c/campaigns/new" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
                Nouvelle campagne
              </Link>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>Chargement...</div>
          ) : campaigns.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "60px 40px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <h2 style={{ color: "#f8fafc", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Aucune campagne</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>
                Lancez votre première campagne pour évaluer vos bénéficiaires.
              </p>
              <Link href="/dashboard/b2b2c/campaigns/new" className="btn btn-primary btn-md" style={{ textDecoration: "none" }}>
                Créer une campagne
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {activeCampaigns.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                    <CheckCircle2 size={14} style={{ display: "inline", marginRight: 6, color: "#34d399" }} />
                    Campagnes actives ({activeCampaigns.length})
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                    {activeCampaigns.map(c => <CampaignCard key={c.id} c={c} />)}
                  </div>
                </div>
              )}
              {plannedCampaigns.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                    <Clock size={14} style={{ display: "inline", marginRight: 6, color: "#38bdf8" }} />
                    En préparation ({plannedCampaigns.length})
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                    {plannedCampaigns.map(c => <CampaignCard key={c.id} c={c} />)}
                  </div>
                </div>
              )}
              {closedCampaigns.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                    <Archive size={14} style={{ display: "inline", marginRight: 6, color: "#475569" }} />
                    Historique ({closedCampaigns.length})
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16, opacity: 0.75 }}>
                    {closedCampaigns.map(c => <CampaignCard key={c.id} c={c} />)}
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
