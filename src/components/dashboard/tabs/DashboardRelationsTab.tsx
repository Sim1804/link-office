"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Star, Lock } from "lucide-react";
import Link from "next/link";

export function DashboardRelationsTab({ isPremium }: { isPremium: boolean }) {
  const [relations, setRelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }
    
    fetch("/api/carnet/relations")
      .then(res => res.json())
      .then(data => {
        if (data.success) setRelations(data.relations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isPremium]);

  if (!isPremium) {
    return (
      <div style={{
        marginTop: 8,
        borderRadius: 24,
        border: "1px solid rgba(124,58,237,0.2)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Blurred preview content */}
        <div style={{ filter: "blur(6px)", opacity: 0.4, padding: "24px", pointerEvents: "none" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 150, height: 20, background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
              <div style={{ width: 80, height: 20, background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
            </div>
            <div style={{ width: "100%", height: 120, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
          </div>
        </div>
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(11,15,25,0) 0%, rgba(11,15,25,0.97) 50%)",
        }} />
        {/* CTA */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
          padding: "40px 32px 32px",
          textAlign: "center",
        }}>
          <div style={{
            width: 48, height: 48, margin: "0 auto 16px",
            borderRadius: 12, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Lock size={20} color="#94a3b8" />
          </div>
          <h4 style={{ fontFamily: "Inter, sans-serif", color: "#f8fafc", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Réseau de soutien réservé aux abonnés Premium
          </h4>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Cartographiez vos relations ressources et accédez à la mise en relation avec votre Binôme Relationnel.
          </p>
          <Link href="/premium" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 600, textDecoration: "none"
          }}>
            Débloquer cette section →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, animation: "fadeSlideIn 0.4s ease-out" }}>
      {/* Section Binôme */}
      <div style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.05) 100%)",
        border: "1px solid rgba(124,58,237,0.2)",
        padding: 32, borderRadius: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 24
      }}>
        <div>
          <h3 style={{ color: "#f8fafc", fontSize: 20, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <Star size={24} color="#a78bfa" />
            Mon Binôme Relationnel
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 500, lineHeight: 1.6 }}>
            Accédez à votre espace dédié pour gérer vos mises en relation, découvrir vos suggestions et réaliser vos check-ins hebdomadaires.
          </p>
        </div>
        <Link href="/binome" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
          fontWeight: 600, padding: "14px 28px", borderRadius: 14,
          textDecoration: "none", fontSize: 15,
          boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
          transition: "all 0.2s"
        }}>
          Accéder au Binôme →
        </Link>
      </div>

      {/* Cartographie de l'entourage */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={20} color="#38bdf8" />
            Mes Relations Ressources
          </h3>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#f8fafc", padding: "8px 16px", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
          }}>
            <Plus size={16} /> Ajouter une relation
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#64748b", textAlign: "center" }}>Chargement de vos relations...</p>
        ) : relations.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 16 }}>
            <div style={{ width: 64, height: 64, background: "rgba(56,189,248,0.1)", borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Users size={32} color="#38bdf8" />
            </div>
            <h4 style={{ color: "#f8fafc", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Aucune relation enregistrée</h4>
            <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 400, margin: "0 auto" }}>
              Identifiez les personnes sur lesquelles vous pouvez compter pour obtenir du soutien (émotionnel, pratique, etc.) sans divulguer leurs données personnelles.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
            {relations.map(rel => (
              <div key={rel.id} style={{
                background: "rgba(17,24,39,0.5)", border: "1px solid rgba(255,255,255,0.05)",
                padding: 20, borderRadius: 16
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#38bdf8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {rel.category}
                </div>
                <div style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                  {rel.name}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div><strong style={{ color: "#cbd5e1" }}>Fréquence :</strong> {rel.frequency}</div>
                  <div><strong style={{ color: "#cbd5e1" }}>Proximité :</strong> {rel.proximity}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
