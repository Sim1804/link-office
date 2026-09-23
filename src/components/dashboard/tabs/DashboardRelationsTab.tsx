"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Handshake, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { UpsellBanner } from "@/components/ui/UpsellBanner";

interface DashboardRelationsTabProps {
  isPremium: boolean;
  isPremiumPlus?: boolean;
}

export function DashboardRelationsTab({ isPremium, isPremiumPlus = false }: DashboardRelationsTabProps) {
  const [relations, setRelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [binomeStatus, setBinomeStatus] = useState<"none" | "pending" | "active">("none");

  useEffect(() => {
    if (!isPremiumPlus) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch("/api/carnet/relations").then(r => r.json()).catch(() => ({ success: false })),
      fetch("/api/binome/status").then(r => r.json()).catch(() => ({ status: "none" })),
    ]).then(([relData, binData]) => {
      if (relData.success) setRelations(relData.relations);
      setBinomeStatus(binData.status ?? "none");
      setLoading(false);
    });
  }, [isPremiumPlus]);

  // ── Freemium : aucun abonnement ────────────────────────────────────────
  if (!isPremium && !isPremiumPlus) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Aperçu relations — accessible en Premium */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "20px 24px",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
            Mes Relations Ressources
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            Disponible dès l'abonnement Premium — cartographiez vos relations de soutien.
          </p>
        </div>

        {/* Binôme — Premium+ */}
        <UpsellBanner
          variant="freemium"
          featureName="Mon Binôme Relationnel"
          description="Le Binôme Relationnel est une fonctionnalité exclusive Premium+. Passez à Premium pour débloquer vos résultats détaillés, puis à Premium+ pour le Binôme."
        />
      </div>
    );
  }

  // ── Premium (sans Plus) : accès partiel, upsell Premium+ ────────────────
  if (isPremium && !isPremiumPlus) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Info : relations accessibles en Premium */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "20px 24px",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
            Mes Relations Ressources
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            Cartographiez les personnes de soutien dans votre vie — disponible avec votre abonnement Premium.
          </p>
        </div>

        {/* Upsell Binôme → Premium+ avec variant dédié */}
        <UpsellBanner
          variant="premium"
          featureName="Mon Binôme Relationnel"
          description="Le Binôme Relationnel est exclusif Premium+. Vous êtes déjà Premium 🎉 — passez à Premium+ pour accéder aux mises en relation personnalisées, aux suggestions IRIS et aux check-ins hebdomadaires."
        />
      </div>
    );
  }

  // ── Premium+ : accès complet ──────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, animation: "fadeSlideIn 0.4s ease-out" }}>

      {/* Section Binôme */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,169,157,0.06) 0%, rgba(6,182,212,0.02) 100%)",
        border: "1px solid rgba(0,169,157,0.2)",
        padding: "20px 24px", borderRadius: 16,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(0,169,157,0.1)", border: "1px solid rgba(0,169,157,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Handshake size={20} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>
              Mon Binôme Relationnel
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
              {binomeStatus === "active"
                ? "Votre binôme est actif — consultez vos check-ins."
                : binomeStatus === "pending"
                  ? "Mise en relation en cours de validation."
                  : "Découvrez votre correspondance relationnelle."}
            </p>
          </div>
        </div>
        <Link
          href="/binome"
          className="btn btn-primary btn-md"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {binomeStatus === "active" ? "Mon espace Binôme" : "Accéder au Binôme"}
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Cartographie de l'entourage */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={18} color="var(--primary)" />
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>
              Mes Relations Ressources
            </h3>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
            ))}
          </div>
        ) : relations.length === 0 ? (
          <div style={{
            padding: "36px 24px", textAlign: "center",
            background: "var(--surface)", border: "1px dashed var(--border)",
            borderRadius: 16,
          }}>
            <div style={{
              width: 52, height: 52,
              background: "rgba(0,169,157,0.08)", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <UserCheck size={24} color="var(--primary)" />
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>Aucune relation enregistrée</h4>
            <p style={{ fontSize: 13, color: "var(--text-2)", maxWidth: 380, margin: "0 auto" }}>
              Identifiez les personnes sur lesquelles vous pouvez compter pour du soutien émotionnel ou pratique.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {relations.map(rel => (
              <div key={rel.id} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                padding: "16px 20px", borderRadius: 14,
                transition: "border-color 0.15s",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {rel.category}
                </div>
                <div style={{ color: "var(--text-1)", fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{rel.name}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-2)" }}>Fréquence : </span>{rel.frequency}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-2)" }}>Proximité : </span>{rel.proximity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
