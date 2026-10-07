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
    <div className="flex items-center gap-2 border-b border-[#E3EBE6] pb-4 mb-6 overflow-x-auto scrollbar-none">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-jakarta font-semibold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-[#00A99D] text-white font-bold shadow-xs ring-1 ring-[#00A99D]"
                : "bg-white border border-[#E3EBE6] text-[#123D46]/75 hover:text-[#123D46] hover:bg-[#FAF9F5] hover:border-[#CBD5E1]"
            }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#123D46]/60"}`} />}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
