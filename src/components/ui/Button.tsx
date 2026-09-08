/**
 * @file Button.tsx
 * @module src/components/ui
 * @description Composant Button réutilisable avec variantes, tailles et état de chargement.
 *
 * Composant de base du design system LinkOffice. Encapsule un élément `<button>` natif
 * tout en appliquant automatiquement :
 * - Les styles de variantes (couleur, effet glow, hover)
 * - La gestion des états `disabled` et `loading`
 * - Les styles d'accessibilité (focus ring, cursor not-allowed)
 *
 * Variantes disponibles :
 * | Variante    | Usage principal                                  |
 * | ----------- | ------------------------------------------------ |
 * | `primary`   | Action principale (CTA, validation)              |
 * | `secondary` | Action secondaire (navigation, options)          |
 * | `ghost`     | Action tertiaire (annulation, liens)             |
 * | `danger`    | Action destructive (suppression)                 |
 * | `amber`     | Action spéciale (upgrade, alerte positive)       |
 *
 * @see src/index.css — Variables CSS utilisées (couleurs, shadows, transitions)
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleSubmit}>
 *   Valider
 * </Button>
 *
 * @example
 * <Button variant="danger" loading={isDeleting}>
 *   Supprimer le compte
 * </Button>
 */
"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

/** Props du composant Button (étend tous les attributs natifs du bouton HTML) */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante visuelle du bouton.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "amber";
  /**
   * Taille du bouton.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Si true : affiche un spinner SVG et désactive le bouton.
   * Utilisé pendant les appels API pour éviter les doubles soumissions.
   */
  loading?: boolean;
}

/**
 * Bouton interactif avec système de design intégré.
 * Utilise `forwardRef` pour permettre l'usage de `ref` par les composants parents
 * (formulaires React Hook Form, animations, focus management).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className, disabled, ...rest }, ref) => {
    /** Classes CSS communes à toutes les variantes */
    const baseClasses = "btn";

    /** Classes spécifiques à chaque variante */
    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      danger: "btn-danger",
      amber: "btn-amber",
    };

    /** Classes de taille (padding + taille du texte) */
    const sizeClasses = {
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    };

    return (
      <button
        ref={ref}
        className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        // Désactivé si `disabled` ou `loading` (évite les doubles soumissions)
        disabled={disabled || loading}
        {...rest}
      >
        {/* Spinner SVG affiché pendant le chargement */}
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
