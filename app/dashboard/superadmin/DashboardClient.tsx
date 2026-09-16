"use client";

import { Building2, Handshake, Users, AlertCircle, ChevronRight, Activity, TrendingUp, BrainCircuit, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { IrisDrawer } from "@/components/superadmin/IrisDrawer";

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
  const [isIrisOpen, setIsIrisOpen] = useState(false);

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
        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
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
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />{stats.orgsB2B} Entreprises (B2B)</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }} />{stats.orgsB2B2C} Mutuelles (B2B2C)</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />{stats.orgsB2G} Collectivités (B2G)</span>
          </div>
          <div style={{ width: "100%", height: 4, background: "rgba(18,61,70,0.05)", borderRadius: 4, marginTop: 16, overflow: "hidden" }}>
            <div style={{ width: `${stats.orgsTotal > 0 ? (stats.orgsB2B / stats.orgsTotal) * 100 : 0}%`, height: "100%", background: "var(--primary)" }} />
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "rgba(245,158,11,0.05)", borderBottomLeftRadius: 80 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Devis Prioritaires</span>
            <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>{stats.leadsUrgent} Récents</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: stats.leadsUrgent > 0 ? "#f59e0b" : "var(--text-1)", letterSpacing: "-0.02em" }}>{stats.leadsTotal}</span>
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>Leads totaux</span>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-2)" }}>
            {stats.leadsUrgent > 0 ? "Leads qualifiés en attente de conversion." : "Aucun lead prioritaire en attente."}
          </p>
          <div style={{ marginTop: 16 }}>
            <Link href="/dashboard/superadmin/leads" style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Convertir & inspecter <Activity size={14} />
            </Link>
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "rgba(99,102,241,0.05)", borderBottomLeftRadius: 80 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Comptes Rattachés</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>{stats.usersTotal.toLocaleString('fr-FR')}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>94% actifs</span>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-2)" }}>
            Base totale des employés, DRH et bénéficiaires.
          </p>
          <div style={{ width: "100%", height: 4, background: "rgba(18,61,70,0.05)", borderRadius: 4, marginTop: 16, overflow: "hidden" }}>
            <div style={{ width: "94%", height: "100%", background: "#6366f1" }} />
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "rgba(0,169,157,0.05)", borderBottomLeftRadius: 80 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Médiathèque Scientifique</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
              <BookOpen size={16} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>{stats.mediaTotal}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}><BrainCircuit size={12} /> 100% Vectorisé</span>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-2)" }}>
            Guides cliniques, podcasts & corpus CNRS
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, fontSize: 12 }}>
            <span style={{ color: "var(--text-2)" }}>Synchronisation IRIS</span>
            <span style={{ color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} /> Temps réel</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, paddingBottom: 64 }}>
        {/* Urgent Leads Quick Action Column */}
        <div style={{ flex: "1 1 600px" }}>
          <div className="card" style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Handshake size={20} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>Pipeline Entrant : Demandes Prioritaires</h3>
              </div>
              <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(245,158,11,0.15)", color: "#d97706", fontSize: 12, fontWeight: 700 }}>
                3 devis en attente
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {stats.recentLeads && stats.recentLeads.length > 0 ? (
                stats.recentLeads.map((lead: any) => (
                  <div key={lead.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, transition: "background 0.2s", cursor: "pointer" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "var(--surface)"}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>{lead.organization}</span>
                          <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(99,102,241,0.1)", color: "#6366f1", fontSize: 11, fontWeight: 600 }}>
                            {lead.planType}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--text-2)", fontSize: 13, marginTop: 8 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Users size={14} /> {lead.companySize || lead.populationSize || lead.beneficiaries || "Non spécifié"}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontWeight: 500 }}>
                            <Activity size={14} /> Nouveau
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/dashboard/superadmin/leads`}>
                          <button className="btn btn-primary btn-sm">Convertir</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                  Aucune demande prioritaire en attente.
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Protocole d'intégration : Délai moyen de déploiement 6 jours</span>
              <Link href="/dashboard/superadmin/leads" style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                Voir toutes les opportunités (7) <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* IRIS Real-time Algorithmic Health */}
        <div style={{ flex: "1 1 360px" }}>
          <div className="card" style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(99,102,241,0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Activity size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>Indice National IQRH</h3>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>Cohortes agrégées 2026</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#6366f1", lineHeight: 1 }}>68.4</div>
                <span style={{ fontSize: 12, color: "var(--text-2)" }}>/ 100 Climat Sain</span>
              </div>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 24 }}>
              {/* Fake SVG Gauge */}
              <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(18,61,70,0.05)" strokeWidth="3.5" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeDasharray="68, 100" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "var(--text-1)" }}>
                  68%
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-1)" }}>Sécurité Psychologique</span>
                    <span style={{ fontWeight: 700, color: "var(--primary)" }}>72 / 100</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "rgba(18,61,70,0.05)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: "72%", height: "100%", background: "var(--primary)" }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-1)" }}>Isolement Télé-hybride</span>
                    <span style={{ fontWeight: 700, color: "#f59e0b" }}>41 / 100</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "rgba(18,61,70,0.05)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: "41%", height: "100%", background: "#f59e0b" }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(239,68,68,0.05)", padding: 16, borderRadius: 12, display: "flex", gap: 12, alignItems: "flex-start", marginBottom: "auto" }}>
              <AlertCircle size={20} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.5 }}>
                <strong style={{ color: "#ef4444" }}>Alerte Cohorte :</strong> Décrochage soudain de -14pts dans l'équipe "Ingénierie Centrale" chez Lumina Retail. Notification IRIS envoyée au DRH référent.
              </p>
            </div>

            <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>18 420 réponses analysées ce mois</span>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--indigo)" }}>
                Lancer diagnostic complet <TrendingUp size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <IrisDrawer isOpen={isIrisOpen} onClose={() => setIsIrisOpen(false)} />
    </>
  );
}
