import { LucideIcon } from "lucide-react";

export interface TabOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardTabsProps {
  tabs: readonly TabOption[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div
      style={{
        display: "flex", gap: 8,
        background: "var(--surface-2)", padding: 6,
        borderRadius: 9999, width: "fit-content",
        marginBottom: 32
      }}
    >
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 9999, border: "none",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer", transition: "all 0.2s",
              background: isActive ? "var(--primary)" : "transparent",
              color: isActive ? "white" : "var(--text-2)",
              boxShadow: isActive ? "0 2px 8px rgba(124,58,237,0.25)" : "none",
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
