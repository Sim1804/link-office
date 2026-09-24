"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MapPin, Calendar, ChevronRight, CheckCircle2, Clock, Archive, RefreshCw } from "lucide-react";
import Link from "next/link";
import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string;
  endDate: string;
  targetPopulation: number | null;
  territory: string | null;
  _count: { assessments: number };
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT:       { label: "Brouillon",   color: "var(--text-3)", bg: "rgba(148,163,184,0.12)", icon: Clock },
  PLANIFIEE:   { label: "Planifiée",   color: "var(--cyan)", bg: "rgba(56,189,248,0.12)",  icon: Calendar },
  ACTIVE:      { label: "Active",      color: "var(--emerald)", bg: "rgba(52,211,153,0.12)",  icon: CheckCircle2 },
  EN_CLOTURE:  { label: "En clôture", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  CLOSED:      { label: "Clôturée",   color: "var(--rose)", bg: "rgba(244,63,94,0.12)",   icon: Archive },
  RENOUVELEE:  { label: "Renouvelée", color: "var(--primary)", bg: "rgba(167,139,250,0.12)", icon: RefreshCw },
};

export default function B2GCampaignsListPage() {
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
    const endDate = new Date(c.endDate);
    const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / 86400000);
    const target = c.targetPopulation || 0;
    const completed = c._count?.assessments || 0;
    const completion = target > 0 ? Math.round((completed / target) * 100) : 0;

    return (
      <Link href={`/dashboard/b2g/campaigns/${c.id}`} style={{ textDecoration: "none" }}>
        <div className="card card-hover" style={{ cursor: "pointer", transition: "all 0.25s" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>{c.title}</h3>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: meta.bg, color: meta.color }}>
                  <Icon size={10} /> {meta.label}
                </span>
                {c.territory && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)" }}>
                    <MapPin size={10} /> {c.territory}
                  </span>
                )}
              </div>
              {c.description && <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{c.description}</p>}
            </div>
            <ChevronRight size={16} style={{ color: "var(--text-2)", flexShrink: 0, marginLeft: 8 }} />
          </div>

          {target > 0 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Objectif</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)" }}>{target}</p>
                </div>
                <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Répondants</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "var(--emerald)" }}>{completed}</p>
                </div>
                <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Taux</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: completion >= 70 ? "var(--emerald)" : completion >= 40 ? "#f59e0b" : "var(--rose)" }}>{completion}%</p>
                </div>
              </div>

              {completion > 0 && (
                <div className="progress-bar" style={{ marginBottom: 12 }}>
                  <div className="progress-fill" style={{ width: `${completion}%`, background: completion >= 70 ? "var(--emerald)" : completion >= 40 ? "#f59e0b" : "var(--rose)" }} />
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
              <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px", flex: 1 }}>
                <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Répondants</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: "var(--emerald)" }}>{completed}</p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-2)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={11} />
              {new Date(c.startDate).toLocaleDateString("fr-FR")} — {new Date(c.endDate).toLocaleDateString("fr-FR")}
            </span>
            {c.status === "ACTIVE" && daysLeft > 0 && (
              <span style={{ color: daysLeft <= 30 ? "#f59e0b" : "var(--text-2)" }}>
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
        <PartnerPortalsNavigation />
        <div className="page-container-wide" style={{ position: "relative", zIndex: 1 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={24} style={{ color: "#06b6d4" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans',Inter,sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                Campagnes Territoriales
              </h1>
              <p style={{ color: "var(--text-3)", fontSize: 14 }}>Suivez le déploiement chez vos citoyens</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <Link href="/dashboard/b2g" className="btn btn-tertiary btn-sm">
                Vue d'ensemble B2G
              </Link>
              <Link href="/dashboard/b2g/campaigns/new" className="btn btn-primary btn-sm">
                Nouvelle campagne
              </Link>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>Chargement...</div>
          ) : campaigns.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "60px 40px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
              <h2 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Aucune campagne</h2>
              <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 28 }}>
                Lancez votre première campagne territoriale pour évaluer vos citoyens.
              </p>
              <Link href="/dashboard/b2g/campaigns/new" className="btn btn-primary btn-md">
                Créer une campagne
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {activeCampaigns.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                    <CheckCircle2 size={14} style={{ display: "inline", marginRight: 6, color: "var(--emerald)" }} />
                    Campagnes actives ({activeCampaigns.length})
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                    {activeCampaigns.map(c => <CampaignCard key={c.id} c={c} />)}
                  </div>
                </div>
              )}
              {plannedCampaigns.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                    <Clock size={14} style={{ display: "inline", marginRight: 6, color: "var(--cyan)" }} />
                    En préparation ({plannedCampaigns.length})
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                    {plannedCampaigns.map(c => <CampaignCard key={c.id} c={c} />)}
                  </div>
                </div>
              )}
              {closedCampaigns.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                    <Archive size={14} style={{ display: "inline", marginRight: 6, color: "var(--text-2)" }} />
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
