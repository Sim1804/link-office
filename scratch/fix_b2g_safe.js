const fs = require('fs');
const b2gPath = 'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx';
let b2gContent = fs.readFileSync(b2gPath, 'utf8');

// 1. Add PartnerPortalsNavigation
if (!b2gContent.includes('PartnerPortalsNavigation')) {
  b2gContent = b2gContent.replace(
    '<main className="page-main">',
    '<main className="page-main">\n        <PartnerPortalsNavigation />'
  );
  b2gContent = b2gContent.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect } from "react";\nimport { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";\nimport Link from "next/link";'
  );
}

// 2. Fix Header Icon
b2gContent = b2gContent.replace(
  /<div style=\{\{ width: 52, height: 52, background: "rgba\(6,182,212,0\.12\)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" \}\}>\s*<MapPin style=\{\{ width: 26, height: 26, color: "#06b6d4" \}\} \/>\s*<\/div>/,
  `<div style={{ width: 52, height: 52, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin style={{ width: 26, height: 26, color: "white" }} />
              </div>`
);

// 3. Fix Header Buttons
b2gContent = b2gContent.replace(
  /<div style=\{\{ display: "flex", gap: 12 \}\}>[\s\S]*?<\/div>\s*<\/div>/,
  `<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard/b2g/actions" className="btn btn-primary btn-sm">
                Plan d'action
              </Link>
              <Link href="/dashboard/b2g/campaigns" className="btn btn-secondary btn-sm">
                Gérer les campagnes
              </Link>
            </div>
          </div>`
);

// 4. Clean dark mode colors globally
b2gContent = b2gContent.replaceAll('color: "#f8fafc"', 'color: "var(--text-1)"');
b2gContent = b2gContent.replaceAll('color: "#94a3b8"', 'color: "var(--text-2)"');
b2gContent = b2gContent.replaceAll('color: "#64748b"', 'color: "var(--text-3)"');
b2gContent = b2gContent.replaceAll('background: "rgba(17,24,39,0.5)"', 'background: "var(--surface)"');
b2gContent = b2gContent.replaceAll('background: "rgba(30,41,59,0.8)"', 'background: "var(--surface)", boxShadow: "var(--shadow-card)"');
b2gContent = b2gContent.replaceAll('background: "rgba(15,23,42,0.6)"', 'background: "var(--surface)", boxShadow: "var(--shadow-card)"');
b2gContent = b2gContent.replaceAll('rgba(255,255,255,0.05)', 'var(--bg)');
b2gContent = b2gContent.replaceAll('rgba(255,255,255,0.03)', 'var(--bg)');
b2gContent = b2gContent.replaceAll('rgba(255,255,255,0.1)', 'var(--bg)');
b2gContent = b2gContent.replaceAll('rgba(255,255,255,0.08)', 'var(--border)');
b2gContent = b2gContent.replaceAll('background: "#111827"', 'background: "var(--surface)"');
b2gContent = b2gContent.replaceAll('color: "#475569"', 'color: "var(--text-3)"');
b2gContent = b2gContent.replaceAll('color: "#e2e8f0"', 'color: "var(--text-1)"');
b2gContent = b2gContent.replaceAll('color: "#06b6d4"', 'color: "var(--primary)"');
b2gContent = b2gContent.replaceAll('stroke="#06b6d4"', 'stroke="var(--primary)"');
b2gContent = b2gContent.replaceAll('fill="#06b6d4"', 'fill="var(--primary)"');

// 5. Fix Top Metrics safely
const registeredUsersMatch = b2gContent.match(/<div className="card" style=\{\{ display: "flex", flexDirection: "column", justifyContent: "center" \}\}>[\s\S]*?\{data\.registeredUsersCount \|\| 0\}<\/p>\s*<\/div>/);
if (registeredUsersMatch) {
  b2gContent = b2gContent.replace(
    registeredUsersMatch[0],
    `<div style={{ flex: 1, minWidth: 200, padding: 20, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16 }}>
    <div style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Citoyens Inscrits</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)" }}>{data.registeredUsersCount || 0}</div>
  </div>`
  );
}

const avgScoreMatch = b2gContent.match(/<div className="card" style=\{\{ display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" \}\}>[\s\S]*?\{data\.averages\.global\}<span[\s\S]*?<\/span>\s*<\/p>\s*<\/div>/);
if (avgScoreMatch) {
  b2gContent = b2gContent.replace(
    avgScoreMatch[0],
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
}

b2gContent = b2gContent.replace(
  /<div style=\{\{ display: "grid", gridTemplateColumns: "repeat\(auto-fit, minmax\(240px, 1fr\)\)", gap: 20, marginBottom: 32 \}\}>/,
  '<div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>'
);

fs.writeFileSync(b2gPath, b2gContent);
console.log('Restored b2g page safely');
