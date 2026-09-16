const fs = require('fs');
const path = require('path');

const reportFile = path.join(__dirname, 'dark_mode_report.txt');
const lines = fs.readFileSync(reportFile, 'utf8').split('\n');

const files = lines
  .filter(line => line.startsWith('['))
  .map(line => {
    const match = line.match(/\[(.*?)\]/);
    return match ? match[1] : null;
  })
  .filter(Boolean);

const replacements = [
  // Common Dark Mode text colors
  { from: /#f8fafc/gi, to: 'var(--text-1)' },
  { from: /#e2e8f0/gi, to: 'var(--text-1)' },
  { from: /#475569/gi, to: 'var(--text-2)' },
  { from: /#94a3b8/gi, to: 'var(--text-2)' },
  { from: /#64748b/gi, to: 'var(--text-3)' },
  { from: /#cbd5e1/gi, to: 'var(--text-3)' },
  
  // Theme colors to Primary
  { from: /#a78bfa/gi, to: 'var(--primary)' },
  { from: /#7c3aed/gi, to: 'var(--primary)' },
  { from: /#06b6d4/gi, to: 'var(--primary)' },
  { from: /rgba\(124,\s*58,\s*237,\s*([0-9.]+)\)/g, to: 'rgba(0,169,157,$1)' },

  // Backgrounds and Borders
  { from: /background:\s*["']#111827["']/g, to: 'background: "var(--surface)"' },
  { from: /background:\s*["']rgba\(255,\s*255,\s*255,\s*0\.0[0-9]+.*?\)/g, to: 'background: "var(--surface)"' },
  { from: /background:\s*["']rgba\(255,\s*255,\s*255,\s*0\.1[0-9]*.*?\)/g, to: 'background: "var(--surface)"' },
  { from: /border:\s*["']1px solid rgba\(255,\s*255,\s*255,\s*0\.[0-9]+.*?\)/g, to: 'border: "1px solid var(--border)"' },
  { from: /boxShadow:\s*["']0 [0-9]+px [0-9]+px rgba\(124,\s*58,\s*237,\s*0\.[0-9]+\).*?["']/g, to: 'boxShadow: "var(--shadow-md)"' },
  { from: /boxShadow:\s*["']0 [0-9]+px [0-9]+px rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\).*?["']/g, to: 'boxShadow: "var(--shadow-md)"' }
];

let modifiedCount = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
    modifiedCount++;
  }
});

console.log(`\nSuccessfully applied Clean UI styles to ${modifiedCount} files.`);
