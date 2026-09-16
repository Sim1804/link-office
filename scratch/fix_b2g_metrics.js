const fs = require('fs');
const path = 'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix demographics subtext
content = content.replaceAll('color: "#475569"', 'color: "var(--text-3)"');

// Fix cartography respondants count
content = content.replaceAll('color: "#e2e8f0"', 'color: "var(--text-1)"');

// Fix cartography avg score
content = content.replaceAll('color: "#06b6d4"', 'color: "var(--primary)"');

// Replace top demographics cards to match the top metrics style of rh!
content = content.replace(
  /<div className="card" style=\{\{ display: "flex", flexDirection: "column", justifyContent: "center" \}\}>\s*<div style=\{\{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 \}\}>\s*<Users size=\{20\} style=\{\{ color: "var\(--primary\)" \}\} \/>\s*<span style=\{\{ color: "var\(--text-2\)", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" \}\}>Citoyens Inscrits<\/span>\s*<\/div>\s*<p style=\{\{ fontSize: 48, fontWeight: 800, color: "var\(--text-1\)", lineHeight: 1 \}\}>\s*\{data\.registeredUsersCount || 0\}\s*<\/p>\s*<\/div>/g,
  `<div style={{ flex: 1, minWidth: 200, padding: 20, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16 }}>
    <div style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Citoyens Inscrits</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)" }}>{data.registeredUsersCount || 0}</div>
  </div>`
);

content = content.replace(
  /<div className="card" style=\{\{ display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" \}\}>\s*<div style=\{\{ position: "absolute", top: 16, right: 16 \}\}>\s*<span className="badge badge-emerald" style=\{\{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", fontSize: 11 \}\}>\s*<ShieldAlert size=\{12\} \/> RGPD Anonymat\s*<\/span>\s*<\/div>\s*<div style=\{\{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 \}\}>\s*<Activity size=\{20\} style=\{\{ color: "#06b6d4" \}\} \/>\s*<span style=\{\{ color: "var\(--text-2\)", fontSize: 12 \}\}>Score IQRH territorial moyen<\/span>\s*<\/div>\s*<p style=\{\{ fontSize: 48, fontWeight: 800, color: "var\(--primary\)", lineHeight: 1 \}\}>\s*\{data\.averages\.global\}<span style=\{\{ fontSize: 18, color: "var\(--text-3\)" \}\}>\/100<\/span>\s*<\/p>\s*<\/div>/g,
  `<div style={{ flex: 1, minWidth: 200, padding: 20, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 16, position: "relative" }}>
    <div style={{ position: "absolute", top: 16, right: 16 }}>
      <span className="badge badge-emerald" style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", fontSize: 11 }}>
        <ShieldAlert size={12} /> RGPD Anonymat
      </span>
    </div>
    <div style={{ color: "var(--cyan)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Score IQRH territorial moyen</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)" }}>{data.averages.global}<span style={{ fontSize: 20, color: "var(--text-2)" }}>/100</span></div>
  </div>`
);

content = content.replace(
  /<div style=\{\{ display: "grid", gridTemplateColumns: "repeat\(auto-fit, minmax\(240px, 1fr\)\)", gap: 20, marginBottom: 32 \}\}>/g,
  '<div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>'
);

fs.writeFileSync(path, content);
console.log('Fixed b2g top metrics');
