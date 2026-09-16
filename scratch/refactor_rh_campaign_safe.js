const fs = require('fs');
const filePath = 'd:\\Projects\\link-office\\app\\dashboard\\rh\\campaigns\\[id]\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let changed = false;

if (!content.includes('<PartnerPortalsNavigation />')) {
  // Inject component
  const mainTagMatch = content.match(/<main[^>]*className=["'][^"']*page-main[^"']*["'][^>]*>/);
  if (mainTagMatch) {
    const mainTag = mainTagMatch[0];
    content = content.replace(mainTag, `${mainTag}\n        <PartnerPortalsNavigation />`);
    changed = true;
  }
}

if (changed && !content.includes('PartnerPortalsNavigation"')) {
  // Add import safely!
  // Find the last 'import ' that is at the start of a line to avoid inside multiline imports
  // Actually, let's just insert it before `export default function` or similar.
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImport = content.indexOf(';', lastImportIndex);
    if (endOfImport !== -1) {
      content = content.substring(0, endOfImport + 1) + '\nimport { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";' + content.substring(endOfImport + 1);
    }
  }
}

content = content.replaceAll('color: "#f8fafc"', 'color: "var(--text-1)"');
content = content.replaceAll('color: "#94a3b8"', 'color: "var(--text-2)"');
content = content.replaceAll('color: "#64748b"', 'color: "var(--text-3)"');
content = content.replaceAll('background: "rgba(17,24,39,0.5)"', 'background: "var(--surface)"');
content = content.replaceAll('background: "rgba(30,41,59,0.8)"', 'background: "var(--surface)", boxShadow: "var(--shadow-card)"');
content = content.replaceAll('background: "rgba(15,23,42,0.6)"', 'background: "var(--surface)", boxShadow: "var(--shadow-card)"');
content = content.replaceAll('rgba(255,255,255,0.05)', 'var(--bg)');
content = content.replaceAll('rgba(255,255,255,0.03)', 'var(--bg)');
content = content.replaceAll('rgba(255,255,255,0.1)', 'var(--bg)');
content = content.replaceAll('rgba(255,255,255,0.08)', 'var(--border)');

fs.writeFileSync(filePath, content);
console.log(`Updated ${filePath}`);
