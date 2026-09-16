const fs = require('fs');

const b2gPath = 'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx';
let content = fs.readFileSync(b2gPath, 'utf8');

content = content.replaceAll('rgba(255,255,255,0.03)', 'var(--bg)');
content = content.replaceAll('rgba(124,58,237,0.3)', 'var(--border)');
content = content.replaceAll('color: "#a78bfa"', 'color: "var(--primary)"');
content = content.replaceAll('rgba(89,101,232,0.15)', 'var(--bg)');
content = content.replaceAll('rgba(124,58,237,0.08)', 'var(--bg)');
content = content.replaceAll('background: "rgba(255,255,255,0.05)"', 'background: "var(--bg)"');

fs.writeFileSync(b2gPath, content);
console.log('Cleaned b2g page colors');
