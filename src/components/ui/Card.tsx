/**
 * Card.tsx — Composant Card glassmorphism
 */
import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "violet" | "cyan" | "amber" | "none";
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ glow = "none", hover = false, children, className, ...props }, ref) => {
    const glowMap = {
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
          hover && glow !== "none" && glowMap[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header
export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx("mb-4", className)}>{children}</div>
);

// Card Title
export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={clsx("text-lg font-semibold text-text-primary", className)}>{children}</h3>
);
