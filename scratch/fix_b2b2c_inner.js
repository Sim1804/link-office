const fs = require('fs');

const path = 'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace funnel hardcoded colors with theme variables
content = content.replaceAll('color: "#93c5fd"', 'color: "var(--primary)"');
content = content.replaceAll('background: "#3b82f6"', 'background: "var(--primary)"');
content = content.replaceAll('background: "#8b5cf6"', 'background: "var(--primary)"');
content = content.replaceAll('background: "#10b981"', 'background: "var(--emerald)"');
content = content.replaceAll('rgba(59,130,246,0.1)', 'var(--surface)');
content = content.replaceAll('rgba(59,130,246,0.2)', 'var(--border)');

// Replace inline card border color to standard var
content = content.replaceAll('borderColor:', 'border: "1px solid var(--border)", borderColor:');

fs.writeFileSync(path, content);
console.log('Fixed b2b2c inner card colors');
