import { Sparkles } from "lucide-react";

interface PremiumBadgeProps {
  className?: string;
  style?: React.CSSProperties;
  label?: React.ReactNode;
}

export function PremiumBadge({ className = "", style = {}, label }: PremiumBadgeProps) {
  return (
    <div 
      className={`premium-badge ${className}`}
      style={{
        display: "inline-flex", 
        alignItems: "center", 
        gap: 8,
        background: "linear-gradient(135deg, rgba(0,169,157,0.2) 0%, rgba(6,182,212,0.1) 100%)",
        border: "1px solid rgba(0,169,157,0.3)",
        padding: "6px 16px", 
        borderRadius: 999,
        boxShadow: "0 2px 10px rgba(0,169,157,0.1)",
        ...style
      }}
    >
      <Sparkles 
        size={14} 
        style={{ color: "var(--primary)" }} 
      />
      <span style={{ 
        fontSize: 13, 
        fontWeight: 700, 
        color: "var(--primary)", 
        textTransform: "uppercase", 
        letterSpacing: "0.06em"
      }}>
        {label || "Premium"}
      </span>
    </div>
  );
}
