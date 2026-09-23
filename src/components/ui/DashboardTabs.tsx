import { LucideIcon } from "lucide-react";

export interface TabOption {
  key: string;
  label: string;
  icon?: LucideIcon;
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
        borderBottom: "1px solid var(--surface)",
        paddingBottom: 16,
        marginBottom: 24,
        overflowX: "auto"
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
              padding: "6px 16px", borderRadius: 16, border: isActive ? "1px solid rgba(0,169,157,0.3)" : "1px solid var(--surface)",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer", transition: "all 0.2s",
              background: isActive ? "rgba(0,169,157,0.1)" : "var(--surface)",
              color: isActive ? "var(--primary)" : "var(--text-2)",
            }}
          >
            {Icon && <Icon size={14} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
