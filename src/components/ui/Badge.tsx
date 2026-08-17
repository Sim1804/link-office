/**
 * @file Badge.tsx
 * @module src/components/ui
 * @description Composant Badge — étiquette colorée de type "pill" (pilule arrondie).
 *
 * Utilisé pour afficher des statuts, des niveaux, des catégories ou des labels
 * à travers l'interface (rôles, statuts ICR, priorités, types de défis, etc.).
 *
 * Le système de variantes s'appuie sur les tokens CSS définis dans `index.css` :
 * - `bg-primary/15` = couleur primaire à 15% d'opacité
 * - `text-primary-light` = texte de la couleur primaire claire
 *
 * @see src/index.css — Tokens CSS de couleur et variables de design
 *
 * @example
 * <Badge variant="cyan">Micro-défi</Badge>
 * <Badge variant="violet" size="md">ICR Élevé</Badge>
 */
import { clsx } from "clsx";

/** Props du composant Badge */
interface BadgeProps {
  /** Contenu du badge (texte, icône ou combination) */
  children: React.ReactNode;
  /**
   * Variante de couleur du badge.
   * - `violet` : Accent primaire (défis, rôles admin)
   * - `cyan`   : Accent secondaire (catégories, tags)
   * - `amber`  : Avertissement (niveaux modérés)
   * - `green`  : Succès (défi validé, statut actif)
   * - `red`    : Danger/critique (alertes, score faible)
   * - `default`: Neutre (informations génériques)
   */
  variant?: "violet" | "cyan" | "amber" | "green" | "red" | "default";
  /** Taille du badge : `sm` (par défaut) ou `md` */
  size?: "sm" | "md";
  /** Classes CSS supplémentaires pour personnalisation */
  className?: string;
}

/**
 * Badge/Pill coloré avec système de variantes.
 * Hérite de `React.HTMLAttributes<HTMLSpanElement>` implicitement via clsx.
 */
export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  /** Mapping variante → classes Tailwind */
  const variantClasses = {
    violet: "bg-primary/15 text-primary-light border border-primary/20",
    cyan: "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20",
    amber: "bg-accent-amber/15 text-accent-amber border border-accent-amber/20",
    green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    red: "bg-accent-rose/15 text-accent-rose border border-accent-rose/20",
    default: "bg-surface-2 text-text-secondary border border-border",
  };

  /** Mapping taille → padding et taille de texte */
  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3.5 py-1 text-sm",
  };

  return (
    <span className={clsx("inline-flex items-center rounded-full font-medium", variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
}
