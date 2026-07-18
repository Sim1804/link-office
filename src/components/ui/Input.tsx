/**
 * Input.tsx — Input stylisé
 */
"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
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
              icon && "pl-10",
              error && "border-accent-rose focus:ring-accent-rose/50",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-accent-rose">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
