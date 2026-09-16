const fs = require('fs');

const path = 'd:\\Projects\\link-office\\app\\dashboard\\superadmin\\leads\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replaceAll('color: "#64748b"', 'color: "var(--text-2)"');
content = content.replaceAll('color: "#a78bfa"', 'color: "var(--primary)"');
content = content.replaceAll('color: "#38bdf8"', 'color: "var(--primary)"');
content = content.replaceAll('color: "#fbbf24"', 'color: "#d97706"'); // Amber text needs to be darker on light mode
content = content.replaceAll('rgba(251,191,36,0.12)', 'rgba(245,158,11,0.1)'); // Adjust amber backgrounds
content = content.replaceAll('rgba(245,158,11,0.07)', 'rgba(245,158,11,0.1)'); 
content = content.replaceAll('background: "rgba(0,0,0,0.3)"', 'background: "var(--surface)", border: "1px solid var(--border)"');
content = content.replaceAll('rgba(239,68,68,0.08)', 'rgba(239,68,68,0.1)'); // Red
content = content.replaceAll('rgba(16,185,129,0.08)', 'rgba(16,185,129,0.1)'); // Green
content = content.replaceAll('color: "#34d399"', 'color: "#059669"'); // Emerald text for light mode

fs.writeFileSync(path, content);
console.log('Cleaned leads page colors!');
