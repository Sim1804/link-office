const fs = require('fs');

const targetPath = 'd:\\Projects\\link-office\\app\\dashboard\\superadmin\\leads\\page.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(
  'background: "rgba(17,24,39,0.5)", padding: 4, borderRadius: 12, width: "fit-content"',
  'background: "var(--surface)", padding: 6, borderRadius: 12, border: "1px solid var(--border)", width: "fit-content"'
);

content = content.replace(
  'background: activeTab === key ? "var(--primary, #7c3aed)" : "transparent",',
  'background: activeTab === key ? "var(--primary)" : "transparent",'
);

content = content.replace(
  'color: activeTab === key ? "white" : "#94a3b8",',
  'color: activeTab === key ? "white" : "var(--text-2)",'
);

content = content.replace(
  'boxShadow: activeTab === key ? "0 0 16px rgba(124,58,237,0.3)" : "none",',
  'boxShadow: activeTab === key ? "var(--shadow-glow-cyan)" : "none",'
);

fs.writeFileSync(targetPath, content);
console.log("Tabs styling fixed safely!");
