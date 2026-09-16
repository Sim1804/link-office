const fs = require('fs');

const path = 'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The funnel block in b2b2c
content = content.replace(
  /<div className="card" style={{ background: "var\(--surface\)", border: "1px solid var\(--border\)", borderColor: "rgba\(59,130,246,0.2\)" }}>\s*<p style={{ color: "var\(--text-2\)", fontSize: 13, marginBottom: 4 }}>Eligibles \(Quota\)<\/p>\s*<p style={{ fontSize: 24, fontWeight: 700, color: "var\(--primary\)" }}>\{stats\.activationFunnel\.eligible\}<\/p>\s*<\/div>/g,
  `<div style={{ flex: 1, minWidth: 180, padding: 20, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 16 }}>
    <div style={{ color: "var(--cyan)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Eligibles (Quota)</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)" }}>{stats.activationFunnel.eligible}</div>
  </div>`
);

content = content.replace(
  /<div className="card">\s*<p style={{ color: "var\(--text-2\)", fontSize: 13, marginBottom: 4 }}>Inscrits \(Comptes CrǸǸs\)<\/p>\s*<p style={{ fontSize: 24, fontWeight: 700, color: "var\(--text-1\)" }}>\{stats\.activationFunnel\.activated\}<\/p>\s*<div style={{ width: "100%", background: "var\(--bg\)", height: 4, borderRadius: 2, marginTop: 8 }}>\s*<div style={{ width: `\$\{stats\.activationFunnel\.eligible \? \(stats\.activationFunnel\.activated \/ stats\.activationFunnel\.eligible\) \* 100 : 0\}%`, background: "var\(--primary\)", height: "100%", borderRadius: 2 }} \/>\s*<\/div>\s*<\/div>/g,
  `<div style={{ flex: 1, minWidth: 180, padding: 20, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16 }}>
    <div style={{ color: "var(--primary)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Comptes Créés</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)" }}>{stats.activationFunnel.activated}</div>
  </div>`
);

content = content.replace(
  /<div className="card">\s*<p style={{ color: "var\(--text-2\)", fontSize: 13, marginBottom: 4 }}>Questionnaires CommencǸs<\/p>\s*<p style={{ fontSize: 24, fontWeight: 700, color: "var\(--text-1\)" }}>\{stats\.activationFunnel\.started\}<\/p>\s*<div style={{ width: "100%", background: "var\(--bg\)", height: 4, borderRadius: 2, marginTop: 8 }}>\s*<div style={{ width: `\$\{stats\.activationFunnel\.activated \? \(stats\.activationFunnel\.started \/ stats\.activationFunnel\.activated\) \* 100 : 0\}%`, background: "var\(--primary\)", height: "100%", borderRadius: 2 }} \/>\s*<\/div>\s*<\/div>/g,
  `<div style={{ flex: 1, minWidth: 180, padding: 20, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16 }}>
    <div style={{ color: "var(--amber)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Éval. Commencées</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)" }}>{stats.activationFunnel.started}</div>
  </div>`
);

content = content.replace(
  /<div className="card">\s*<p style={{ color: "var\(--text-2\)", fontSize: 13, marginBottom: 4 }}>Questionnaires ComplǸtǸs<\/p>\s*<p style={{ fontSize: 24, fontWeight: 700, color: "var\(--text-1\)" }}>\{stats\.activationFunnel\.completed\}<\/p>\s*<div style={{ width: "100%", background: "var\(--bg\)", height: 4, borderRadius: 2, marginTop: 8 }}>\s*<div style={{ width: `\$\{stats\.activationFunnel\.started \? \(stats\.activationFunnel\.completed \/ stats\.activationFunnel\.started\) \* 100 : 0\}%`, background: "var\(--emerald\)", height: "100%", borderRadius: 2 }} \/>\s*<\/div>\s*<\/div>/g,
  `<div style={{ flex: 1, minWidth: 180, padding: 20, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16 }}>
    <div style={{ color: "var(--emerald)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Éval. Complétées</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)" }}>{stats.activationFunnel.completed}</div>
  </div>`
);

content = content.replaceAll(
  '<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>',
  '<div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>'
);

fs.writeFileSync(path, content);
console.log('Fixed funnel matching');
