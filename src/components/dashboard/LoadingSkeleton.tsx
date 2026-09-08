/**
 * @file LoadingSkeleton.tsx
 * @module src/components/dashboard
 * @description Squelette de chargement animé pour le dashboard utilisateur.
 *
 * Affiché pendant le chargement asynchrone des données IQRH (résultats, ordonnance).
 * Utilise deux animations CSS :
 * - `pulse` : oscillation globale de l'opacité du conteneur
 * - `shimmer` : reflet balayant chaque bloc de droite à gauche
 *
 * Structure du squelette :
 * 1. En-tête (avatar + titre + sous-titre)
 * 2. Grille de 3 cartes de statistiques
 * 3. Grille de 2 graphiques
 *
 * @see app/dashboard/page.tsx — Page qui utilise ce composant (via Suspense ou chargement conditionnel)
 */

/**
 * Squelette de chargement animé du tableau de bord principal.
 * Reproduit la structure visuelle du dashboard pour éviter le saut de mise en page.
 */
export function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "20px 0", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
      {/* Styles d'animation injectés localement (pas de dépendance externe) */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        /* Effet shimmer : reflet lumineux qui traverse les blocs */
        .skeleton-box::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 100% { left: 150%; } }
      `}</style>

      {/* Squelette de l'en-tête : avatar + titre + description */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 10 }}>
        <div className="skeleton-box" style={{ width: 52, height: 52, borderRadius: 14 }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="skeleton-box" style={{ width: 250, height: 28, borderRadius: 6 }}></div>
          <div className="skeleton-box" style={{ width: 180, height: 16, borderRadius: 4 }}></div>
        </div>
      </div>

      {/* Squelette de la grille de 3 cartes de statistiques */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
        <div className="skeleton-box" style={{ height: 120 }}></div>
        <div className="skeleton-box" style={{ height: 120 }}></div>
        <div className="skeleton-box" style={{ height: 120 }}></div>
      </div>

      {/* Squelette de la grille de 2 graphiques (radar + jauge) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="skeleton-box" style={{ height: 320 }}></div>
        <div className="skeleton-box" style={{ height: 320 }}></div>
      </div>
    </div>
  );
}
