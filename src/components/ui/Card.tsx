/**
 * @file Card.tsx
 * @module src/components/ui
 * @description Composant Card avec effet glassmorphism et variants de glow.
 *
 * Composant de base pour les panneaux, sections et widgets du dashboard.
 * Supporte trois sous-composants exportés pour une composition flexible :
 * - `Card`       : Conteneur principal (glassmorphism + padding + coins arrondis)
 * - `CardHeader` : En-tête de la carte (espacement bas standardisé)
 * - `CardTitle`  : Titre de la carte (taille et couleur standardisés)
 *
 * L'effet de lueur colorée (glow) n'est appliqué qu'au survol et uniquement si
 * `hover={true}` est défini, pour éviter de saturer l'interface de particules.
 *
 * @example
 * <Card glow="violet" hover>
 *   <CardHeader>
 *     <CardTitle>Mon tableau de bord</CardTitle>
 *   </CardHeader>
 *   <p>Contenu...</p>
 * </Card>
 */
import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

/** Props du composant Card */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Couleur du halo lumineux au survol (uniquement si `hover={true}`).
   * - `violet` : Accent primaire
   * - `cyan`   : Accent secondaire
   * - `amber`  : Accent chaleureux
   * - `none`   : Pas de glow (par défaut)
   */
  glow?: "violet" | "cyan" | "amber" | "none";
  /** Si true : ajoute la transition CSS et le curseur pointer */
  hover?: boolean;
}

/**
 * Carte principale avec fond glassmorphism.
 * Utilise `forwardRef` pour permettre l'usage de `ref` par les composants parents
 * (notamment pour les mesures de taille ou les animations via GSAP/Framer Motion).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ glow = "none", hover = false, children, className, ...rest }, ref) => {
    /** Classes de lueur colorée conditionnelles au variant */
    const glowClasses = {
      violet: "hover:shadow-glow-violet hover:border-primary/30",
      cyan: "hover:shadow-glow-cyan hover:border-accent-cyan/30",
      amber: "hover:shadow-glow-amber hover:border-accent-amber/30",
      none: "",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "glass rounded-2xl p-6",
          hover && "transition-all duration-300 cursor-pointer",
          hover && glow !== "none" && glowClasses[glow],
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * En-tête d'une carte (section supérieure avec marge basse standardisée).
 * Peut contenir un `CardTitle`, une description ou des boutons d'action.
 */
export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx("mb-4", className)}>{children}</div>
);

/**
 * Titre d'une carte (h3 avec taille et couleur standardisés).
 * Utilise `text-text-primary` du design system pour la cohérence.
 */
export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={clsx("text-lg font-semibold text-text-primary", className)}>{children}</h3>
);
