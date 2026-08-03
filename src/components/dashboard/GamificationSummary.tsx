"use client";

import Link from "next/link";
import { Award, Star, ArrowRight } from "lucide-react";

export function GamificationSummary({ points, badges }: { points: number, badges: any[] }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 18, color: "#f8fafc" }}>
          Gamification & Progression
        </h2>
        <Link href="/mon-profil" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>
          Voir mon profil complet <ArrowRight size={14} />
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <div className="card card-hover" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Star style={{ width: 20, height: 20, color: "#fbbf24" }} />
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 16, color: "#f8fafc" }}>
              Vos Points d'Évolution
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span style={{ fontSize: 42, fontWeight: 700, color: "#fbbf24", lineHeight: 1 }}>{points}</span>
            <span style={{ fontSize: 14, color: "#94a3b8", marginBottom: 6 }}>pts</span>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
            Gagnez des points pour chaque micro-défi accompli !
          </p>
        </div>

        <div className="card card-hover" style={{ borderColor: "rgba(56,189,248,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Award style={{ width: 20, height: 20, color: "#38bdf8" }} />
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 16, color: "#f8fafc" }}>
              Vos Badges Obtenus
            </h3>
          </div>
          {badges.length > 0 ? (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {badges.map((b: any) => (
                <div key={b.id} title={b.badge.description} className="badge badge-cyan" style={{ fontSize: 12, padding: "6px 12px" }}>
                  <span style={{ fontSize: 16 }}>{b.badge.icon}</span>
                  <span>{b.badge.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#64748b" }}>Vous n'avez pas encore de badges. Continuez vos défis !</p>
          )}
        </div>
      </div>
    </div>
  );
}
