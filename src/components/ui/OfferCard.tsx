import { CheckCircle2 } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface OfferInfo {
  id: "PREMIUM" | "PREMIUM_PLUS" | string;
  icon: LucideIcon;
  color: string;
  border: string;
  bg: string;
  title: string;
  sub: string;
  features: string[];
}

interface OfferCardProps {
  plan: OfferInfo;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function OfferCard({ plan, isSelected, onSelect }: OfferCardProps) {
  const Icon = plan.icon;

  return (
    <div
      onClick={() => onSelect(plan.id)}
      className="card"
      style={{
        cursor: "pointer", transition: "all 0.25s",
        background: isSelected ? plan.bg : "var(--surface)",
        borderColor: isSelected ? `${plan.border}80` : "var(--border)",
        outline: isSelected ? `2px solid ${plan.border}60` : "none",
        outlineOffset: 2,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${plan.color}20`, border: `1px solid ${plan.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={22} style={{ color: plan.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-1)", margin: 0 }}>{plan.title}</h3>
            <span style={{ fontSize: 12, color: plan.color, fontWeight: 600 }}>{plan.sub}</span>
            {isSelected && (
              <div style={{ marginLeft: "auto", width: 22, height: 22, borderRadius: "50%", background: plan.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 12, fontWeight: 900 }}>✓</span>
              </div>
            )}
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {plan.features.map((f, i) => (
              <li key={i} style={{ fontSize: 13, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={14} style={{ color: plan.color, flexShrink: 0 }} /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
