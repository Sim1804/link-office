/**
 * @file B2b2cMemberRecommendations.tsx
 * @module src/components/dashboard
 * @description Section "Ma Mutuelle & Prévention" du dashboard utilisateur B2B2C.
 *
 * Ce composant est spécifique aux membres d'une organisation B2B2C (mutuelle).
 * Il charge les services de prévention recommandés par la mutuelle en fonction
 * du profil IQRH de l'utilisateur, puis les affiche avec leur priorité et un lien.
 *
 * Comportement :
 * - Au montage : appel GET vers `/api/b2b2c/orientation` pour charger les recommandations
 * - En chargement : spinner d'attente
 * - Sans résultats ou données vides : affichage supprimé (ne pollue pas le dashboard)
 * - Avec résultats : grille de cartes de recommandations triées par priorité
 *
 * Confidentialité : Une bannière RGPD rappelle que la mutuelle n'accède
 * jamais aux réponses individuelles (uniquement à l'orientation globale).
 *
 * @see app/api/b2b2c/orientation/route.ts — Route API qui calcule les recommandations
 * @see app/dashboard/page.tsx — Page qui inclut ce composant conditionnellement
 */

"use client";

import { useState, useEffect } from "react";
import { Heart, ExternalLink, RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";

/**
 * Section de recommandations personnalisées de la mutuelle B2B2C.
 * Charge ses données de façon autonome (pas de props) via l'API d'orientation.
 *
 * Affiché uniquement si l'utilisateur appartient à une organisation B2B2C
 * ET si des recommandations sont disponibles pour son profil.
 */
export function B2b2cMemberRecommendations() {
  /** Données de recommandations reçues de l'API (null pendant le chargement) */
  const [orientationData, setOrientationData] = useState<any>(null);
  /** true pendant l'appel API initial */
  const [isLoading, setIsLoading] = useState(true);

  // Chargement des recommandations au montage du composant
  useEffect(() => {
    fetch("/api/b2b2c/orientation")
      .then((response) => response.json())
      .then(setOrientationData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div style={{ background: "rgba(255,255,255,0.03)", padding: 24, borderRadius: 16, marginBottom: 32, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <RefreshCw size={18} style={{ animation: "spin 1s linear infinite", color: "#64748b" }} />
        <span style={{ color: "#64748b" }}>Analyse de vos recommandations mutuelle...</span>
      </div>
    );
  }

  // Masquage propre si l'utilisateur n'a pas de résultats ou de recommandations
  if (!orientationData?.hasResults || orientationData.recommendations?.length === 0) {
    return null; // Ne pollue pas le dashboard s'il n'y a rien à recommander
  }

  return (
    <div style={{ marginBottom: 40 }}>
      {/* En-tête de la section mutuelle */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, background: "rgba(16,185,129,0.12)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart style={{ width: 22, height: 22, color: "#34d399" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 20, color: "#f8fafc" }}>
            Ma Mutuelle & Prévention
          </h2>
          <p style={{ color: "#64748b", fontSize: 13 }}>Services personnalisés recommandés par votre organisme</p>
        </div>
      </div>

      {/* Bannière de confidentialité RGPD */}
      <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <ShieldCheck size={16} style={{ color: "#34d399", flexShrink: 0 }} />
        <p style={{ color: "#6ee7b7", fontSize: 13 }}>
          Ces recommandations sont proposées par l'algorithme. Votre mutuelle ne voit aucune de vos réponses individuelles.
        </p>
      </div>

      {/* Grille de cartes de recommandations */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {orientationData.recommendations.map((recommendation: any, index: number) => (
          <div
            key={index}
            className="card card-hover"
            // Bordure violette = priorité haute, cyan = priorité normale
            style={{ borderLeft: `3px solid ${recommendation.priority === "haute" ? "#a78bfa" : "#06b6d4"}` }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              {/* Icône de la recommandation */}
              <div style={{ fontSize: 28, flexShrink: 0 }}>{recommendation.icon}</div>
              <div style={{ flex: 1 }}>
                {/* Badge de priorité */}
                <span className={`badge ${recommendation.priority === "haute" ? "badge-violet" : "badge-cyan"}`} style={{ marginBottom: 8, display: "inline-block" }}>
                  Priorité {recommendation.priority}
                </span>

                {/* Titre du service recommandé */}
                <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                  {recommendation.organizationService?.title ?? recommendation.service}
                </h3>

                {/* Déclencheur IQRH qui justifie cette recommandation */}
                <p style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>
                  <AlertCircle size={11} style={{ display: "inline", marginRight: 4 }} />
                  {recommendation.trigger}
                </p>

                {/* Lien externe vers le service de la mutuelle */}
                {recommendation.organizationService?.linkUrl && (
                  <a
                    href={recommendation.organizationService.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ textDecoration: "none" }}
                  >
                    En savoir plus <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Animation CSS du spinner de chargement */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
