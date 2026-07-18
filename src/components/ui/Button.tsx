/**
 * Button.tsx — Composant Button réutilisable
 */
"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "amber";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-primary hover:bg-primary-hover text-white focus:ring-primary shadow-glow-violet hover:shadow-glow-violet hover:-translate-y-0.5",
      secondary:
        "bg-surface-2 hover:bg-surface-3 text-text-primary border border-border hover:border-border-strong focus:ring-primary",
      ghost:
        "text-text-secondary hover:text-text-primary hover:bg-surface-2 focus:ring-primary",
      danger:
        "bg-accent-rose hover:opacity-90 text-white focus:ring-accent-rose",
      amber:
        "bg-accent-amber hover:opacity-90 text-black font-bold focus:ring-accent-amber shadow-glow-amber hover:-translate-y-0.5",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
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
