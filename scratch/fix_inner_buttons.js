const fs = require('fs');

// 1. Fix DashboardRelationsTab.tsx button
let relPath = 'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardRelationsTab.tsx';
let relContent = fs.readFileSync(relPath, 'utf8');
relContent = relContent.replace(
  /<button style=\{\{\s*display: "flex", alignItems: "center", gap: 6,\s*background: "rgba\(18,61,70,0\.05\)", border: "1px solid var\(--border\)",\s*color: "var\(--text-1\)", padding: "8px 16px", borderRadius: 10,\s*fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0\.2s"\s*\}\}>/gs,
  '<button className="btn btn-secondary btn-sm">'
);
fs.writeFileSync(relPath, relContent);
console.log('Fixed DashboardRelationsTab.tsx inner button');

// 2. Fix DashboardTabs.tsx navigation active tab styling
let tabsPath = 'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardTabs.tsx';
let tabsContent = fs.readFileSync(tabsPath, 'utf8');

// The active tab should just have text-1 color and a simple shadow, no white inset border or weird background.
tabsContent = tabsContent.replace(
  /background: isActive \? "var\(--surface\)" : "transparent",\s*color: isActive \? "var\(--primary\)" : "var\(--text-2\)",\s*fontWeight: isActive \? 600 : 500,\s*fontSize: 13,\s*cursor: "pointer",\s*transition: "all 0\.25s cubic-bezier\(0\.4,0,0\.2,1\)",\s*whiteSpace: "nowrap",\s*boxShadow: isActive \? "0 2px 8px rgba\(0,0,0,0\.08\), inset 0 1px 0 #fff" : "none",\s*border: isActive \? "1px solid var\(--border\)" : "1px solid transparent",\s*letterSpacing: isActive \? "0\.01em" : "0",/gs,
  `background: isActive ? "var(--surface)" : "transparent",
                color: isActive ? "var(--text-1)" : "var(--text-2)",
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                whiteSpace: "nowrap",
                boxShadow: isActive ? "var(--shadow-card)" : "none",
                border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                letterSpacing: "0",`
);

// We also need to fix the badge that says "Passation actuelle"
tabsContent = tabsContent.replace(
  /background: "var\(--primary\)",\s*color: "var\(--text-1\)", fontSize: 10, fontWeight: 800,\s*padding: "3px 12px", borderRadius: 999,\s*textTransform: "uppercase", letterSpacing: "0\.06em",\s*boxShadow: "0 2px 12px rgba\(124,58,237,0\.4\)",/gs,
  `background: "var(--primary)",
                    color: "#fff", fontSize: 10, fontWeight: 800,
                    padding: "3px 12px", borderRadius: 999,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    boxShadow: "0 2px 4px rgba(0,169,157,0.2)",`
);

fs.writeFileSync(tabsPath, tabsContent);
console.log('Fixed DashboardTabs.tsx active tab and badge');

