const fs = require('fs');

const filepath = 'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardJournalTab.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/background: newEntry.trim\(\) \? "linear-gradient\(135deg, #7c3aed, #6d28d9\)" : "var\(--border\)",/g, 
  'background: newEntry.trim() ? "var(--primary)" : "var(--border)",');

content = content.replace(/color: newEntry.trim\(\) \? "#fff" : "#64748b",/g, 
  'color: newEntry.trim() ? "var(--surface)" : "var(--text-3)",');

fs.writeFileSync(filepath, content);
console.log('Fixed DashboardJournalTab.tsx');
