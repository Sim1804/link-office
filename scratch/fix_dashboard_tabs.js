const fs = require('fs');

const filepath = 'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardTabs.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Fix dark background in Carnet de Sante header
content = content.replace(/background: "linear-gradient\(135deg, var\(--surface\) 0%, rgba\(30,27,75,0\.6\) 100%\)"/g, 
  'background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)"');

// Fix dark gradient fade
content = content.replace(/background: "linear-gradient\(to bottom, rgba\(11,15,25,0\) 0%, rgba\(11,15,25,0\.97\) 50%\)"/g, 
  'background: "linear-gradient(to bottom, rgba(244,241,232,0) 0%, rgba(244,241,232,0.97) 50%)"'); // var(--bg) fade

// Fix purple buttons to primary buttons
content = content.replace(/background: "linear-gradient\(135deg, #7c3aed 0%, #6d28d9 100%\)"/g, 'background: "var(--primary)"');
content = content.replace(/background: "linear-gradient\(135deg, #7c3aed, #6d28d9\)"/g, 'background: "var(--primary)"');
content = content.replace(/boxShadow: "0 4px 20px rgba\(124,58,237,0\.35\)"/g, 'boxShadow: "0 4px 20px var(--primary-glow)"');
content = content.replace(/border: "1px solid rgba\(124,58,237,0\.2\)"/g, 'border: "1px solid var(--border-strong)"');

// Fix text colors from purple to primary
content = content.replace(/color: "#a78bfa"/g, 'color: "var(--primary)"');
content = content.replace(/background: "rgba\(124,58,237,0\.1\)"/g, 'background: "var(--primary-glow)"');
content = content.replace(/background: "rgba\(167,139,250,0\.08\)"/g, 'background: "var(--primary-glow)"');

fs.writeFileSync(filepath, content);
console.log('Fixed DashboardTabs.tsx');
