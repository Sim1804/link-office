const fs = require('fs');

function standardizeHeader(filePath, iconName, oldBtnContainer, newBtnContainer, oldIconBox, newIconBox) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (oldBtnContainer && newBtnContainer) {
    content = content.replace(oldBtnContainer, newBtnContainer);
  }
  
  if (oldIconBox && newIconBox) {
    content = content.replace(oldIconBox, newIconBox);
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Standardized ${filePath}`);
}

// For b2g
const b2gOldBtns = `<div style={{ display: "flex", gap: 12 }}>
              <Link href="/dashboard/b2g/actions" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", color: "var(--primary)", padding: "10px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "1px solid var(--border)", textDecoration: "none", transition: "all 0.2s" }}>
                Plan d'action
              </Link>
              <Link href="/dashboard/b2g/campaigns" className="btn btn-secondary" style={{ padding: "10px 16px", fontSize: 14, textDecoration: "none", borderRadius: 10 }}>
                Gérer les campagnes
              </Link>
            </div>`;
// Actually b2gOldBtns might have original text since clean_b2g.js was run. Let's do string replaces that don't depend on exact full block matching.

let b2gContent = fs.readFileSync('d:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx', 'utf8');

// Icon box in b2g
b2gContent = b2gContent.replace(
  '<div style={{ width: 52, height: 52, background: "rgba(6,182,212,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>\n                <MapPin style={{ width: 26, height: 26, color: "#06b6d4" }} />\n              </div>',
  '<div style={{ width: 52, height: 52, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>\n                <MapPin style={{ width: 26, height: 26, color: "white" }} />\n              </div>'
);

// Buttons in b2g
// Let's replace the whole div by finding its start and end
let b2gBtnStart = b2gContent.indexOf('<div style={{ display: "flex", gap: 12 }}>');
if (b2gBtnStart !== -1) {
  let b2gBtnEnd = b2gContent.indexOf('</div>', b2gBtnStart) + '</div>'.length;
  
  const b2gNewBtns = `<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard/b2g/actions" className="btn btn-primary btn-sm">
                Plan d'action
              </Link>
              <Link href="/dashboard/b2g/campaigns" className="btn btn-secondary btn-sm">
                Gérer les campagnes
              </Link>
            </div>`;
  b2gContent = b2gContent.substring(0, b2gBtnStart) + b2gNewBtns + b2gContent.substring(b2gBtnEnd);
}

fs.writeFileSync('d:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx', b2gContent);

// For b2b2c
let b2b2cContent = fs.readFileSync('d:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx', 'utf8');

b2b2cContent = b2b2cContent.replace(
  '<div style={{ width: 52, height: 52, background: "rgba(0,169,157,0.1)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-glow-cyan)" }}>\n                <ShieldCheck style={{ width: 26, height: 26, color: "var(--primary)" }} />\n              </div>',
  '<div style={{ width: 52, height: 52, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>\n                <ShieldCheck style={{ width: 26, height: 26, color: "white" }} />\n              </div>'
);

b2b2cContent = b2b2cContent.replace(
  '<Link href="/dashboard/b2b2c/campaigns" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>\n                Gérer mes campagnes\n              </Link>',
  '<Link href="/dashboard/b2b2c/campaigns" className="btn btn-secondary btn-sm">\n                Gérer mes campagnes\n              </Link>'
);

b2b2cContent = b2b2cContent.replace(
  '<Link href="/dashboard/actions" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>\n                Recommandations (Plan)\n              </Link>',
  '<Link href="/dashboard/actions" className="btn btn-primary btn-sm">\n                Recommandations (Plan)\n              </Link>'
);

fs.writeFileSync('d:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx', b2b2cContent);

console.log('Standardized headers!');
