/**
 * Badge.tsx — Badge/Pill coloré
 */
import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "violet" | "cyan" | "amber" | "green" | "red" | "default";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = {
    violet: "bg-primary/15 text-primary-light border border-primary/20",
    cyan: "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20",
    amber: "bg-accent-amber/15 text-accent-amber border border-accent-amber/20",
    green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    red: "bg-accent-rose/15 text-accent-rose border border-accent-rose/20",
    default: "bg-surface-2 text-text-secondary border border-border",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3.5 py-1 text-sm",
  };

  return (
    <span className={clsx("inline-flex items-center rounded-full font-medium", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
