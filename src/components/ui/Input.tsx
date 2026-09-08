/**
 * @file Input.tsx
 * @module src/components/ui
 * @description Composant Input stylisé avec label, icône et gestion d'erreur.
 *
 * Champ de saisie encapsulant l'élément `<input>` natif avec :
 * - Un label associé via `htmlFor` (accessibilité WCAG)
 * - Une icône optionnelle positionnée en absolu à gauche
 * - Un état d'erreur (bordure rouge + message d'erreur)
 * - Les états focus/hover standardisés du design system
 *
 * Compatible avec React Hook Form via `forwardRef` et `{...rest}`.
 *
 * @see src/components/ui/Button.tsx — Bouton complémentaire dans les formulaires
 * @see app/auth/register/page.tsx — Exemple d'utilisation dans un formulaire
 *
 * @example
 * <Input
 *   id="email"
 *   label="Adresse email"
 *   type="email"
 *   icon={<Mail size={16} />}
 *   error={errors.email?.message}
 *   {...register("email")}
 * />
 */
"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

/** Props du composant Input (étend tous les attributs natifs du `<input>` HTML) */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Libellé du champ (associé au `<input>` via `htmlFor` pour l'accessibilité) */
  label?: string;
  /**
   * Message d'erreur de validation.
   * Si renseigné : applique une bordure rouge et affiche le message sous le champ.
   * Compatible avec les messages d'erreur de React Hook Form / Zod.
   */
  error?: string;
  /**
   * Icône affichée à gauche du champ de saisie.
   * Ajoute automatiquement un padding left pour éviter le chevauchement avec le texte.
   */
  icon?: React.ReactNode;
}

/**
 * Champ de saisie stylisé avec label, icône optionnelle et gestion d'erreur.
 * Utilise `forwardRef` pour la compatibilité avec React Hook Form.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {/* Label associé au champ via htmlFor (requis pour l'accessibilité) */}
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}

        {/* Conteneur relatif pour le positionnement de l'icône */}
        <div className="relative">
          {/* Icône positionnée en absolu à gauche — non cliquable (pointer-events-none) */}
          {icon && (
            <div className="absolute inset-y-0 left-3 flex items-center text-text-muted pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            className={clsx(
              "w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200",
              "hover:border-border-strong",
              icon && "pl-10",                               // Padding gauche si icône
              error && "border-accent-rose focus:ring-accent-rose/50", // Bordure rouge si erreur
              className
            )}
            {...rest}
          />
        </div>

        {/* Message d'erreur sous le champ */}
        {error && <p className="text-xs text-accent-rose">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
