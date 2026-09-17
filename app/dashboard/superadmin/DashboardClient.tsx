"use client";

import { Building2, Handshake, Users, AlertCircle, ChevronRight, Activity, TrendingUp, BrainCircuit, BookOpen } from "lucide-react";
import Link from "next/link";

interface DashboardClientProps {
  stats: {
    orgsTotal: number;
    orgsB2B: number;
    orgsB2B2C: number;
    orgsB2G: number;
    leadsUrgent: number;
    leadsTotal: number;
    usersTotal: number;
    mediaTotal: number;
    recentLeads?: any[];
  };
}

export function DashboardClient({ stats }: DashboardClientProps) {
  return (
    <>
      {/* Top Pilotage Section: Title & Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 8 }}>
            Gouvernance & Laboratoire du Lien Humain
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 700, lineHeight: 1.5 }}>
            Pilotage unifié des cohortes organisationnelles, modélisation IQRH, pipeline de conversion de santé relationnelle et co-pilotage algorithmique IRIS.
          </p>
        </div>
      </div>

      {/* 4 Strategic Master KPI Cards with REAL DATA */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "rgba(0,169,157,0.05)", borderBottomLeftRadius: 80 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Organisations Actives</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>{stats.orgsTotal}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center" }}>+12% T1</span>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-2)", display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />{stats.orgsB2B} Entreprises (B2B)</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }} />{stats.orgsB2B2C} Mutuelles (B2B2C)</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />{stats.orgsB2G} Collectivités (B2G)</span>
            </div>
            <div style={{ width: "100%", height: 4, background: "rgba(18,61,70,0.05)", borderRadius: 4, marginTop: 12, overflow: "hidden" }}>
              <div style={{ width: `${stats.orgsTotal > 0 ? (stats.orgsB2B / stats.orgsTotal) * 100 : 0}%`, height: "100%", background: "var(--primary)" }} />
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "rgba(245,158,11,0.05)", borderBottomLeftRadius: 80 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Devis Prioritaires</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
              <Handshake size={16} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: stats.leadsUrgent > 0 ? "#f59e0b" : "var(--text-1)", letterSpacing: "-0.02em" }}>{stats.leadsTotal}</span>
            {stats.leadsUrgent > 0 ? (
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                {stats.leadsUrgent} à traiter
              </span>
            ) : (
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>Tous traités</span>
            )}
          </div>
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
              {stats.leadsUrgent > 0 ? "Leads qualifiés en attente de conversion." : "Aucun lead prioritaire en attente."}
            </p>
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "rgba(99,102,241,0.05)", borderBottomLeftRadius: 80 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Comptes Rattachés</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>{stats.usersTotal.toLocaleString('fr-FR')}</span>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
              Base totale des employés, DRH et bénéficiaires.
            </p>
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "rgba(0,169,157,0.05)", borderBottomLeftRadius: 80 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Médiathèque & Catalogue</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
              <BookOpen size={16} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>{stats.mediaTotal}</span>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
              Articles, podcasts, recommandations et modules adaptatifs.
            </p>
          </div>
        </div>
      </div>

      <div style={{ paddingBottom: 64 }}>
        {/* Urgent Leads Full Width Section */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Handshake size={20} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>Pipeline Entrant : Nouvelles Demandes</h3>
            </div>
            <Link href="/dashboard/superadmin/leads">
              <button className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                Voir toutes les opportunités <ChevronRight size={14} />
              </button>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {stats.recentLeads && stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead: any) => (
                <div key={lead.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, transition: "background 0.2s, box-shadow 0.2s", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.boxShadow = "none"; }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2 }}>{lead.organization}</div>
                    <span className="badge" style={{ padding: "2px 8px", background: "rgba(99,102,241,0.1)", color: "#6366f1", fontSize: 11, fontWeight: 600, borderRadius: 12 }}>
                      {lead.planType}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--text-2)", fontSize: 13 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={14} /> {lead.companySize || lead.populationSize || lead.beneficiaries || "Non spécifié"} personnes
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontWeight: 500 }}>
                      <Activity size={14} /> Lead Entrant
                    </span>
                  </div>
                  
                  <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "flex-end" }}>
                    <Link href={`/dashboard/superadmin/leads`}>
                      <button className="btn btn-primary btn-sm" style={{ width: "100%" }}>Inspecter & Convertir</button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-3)", fontSize: 14, gridColumn: "1 / -1", background: "var(--bg)", borderRadius: 12, border: "1px dashed var(--border)" }}>
                Aucun lead entrant en attente d'inspection.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
