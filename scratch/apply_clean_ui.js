const fs = require('fs');
const path = require('path');

const targetFiles = [
  'app/dashboard/page.tsx',
  'src/components/dashboard/tabs/DashboardBilanTab.tsx',
  'src/components/dashboard/tabs/DashboardTabs.tsx',
  'src/components/dashboard/tabs/DashboardRelationsTab.tsx',
  'app/dashboard/rh/page.tsx',
  'app/dashboard/b2b2c/page.tsx',
  'app/dashboard/b2g/page.tsx',
  'src/components/layout/Navbar.tsx',
];

const replacements = [
  // 1. Purple -> Primary
  { from: /rgba\(124,\s*58,\s*237,\s*([0-9.]+)\)/g, to: 'rgba(0,169,157,$1)' },
  { from: /#7c3aed/g, to: 'var(--primary)' },
  
  // 2. Dark glass backgrounds to surface
  { from: /background:\s*["']rgba\(255,\s*255,\s*255,\s*0\.0[0-9]+.*?\)/g, to: 'background: "var(--surface)"' },
  { from: /background:\s*["']rgba\(255,\s*255,\s*255,\s*0\.1[0-9]*.*?\)/g, to: 'background: "var(--surface)"' },
  
  // 3. Dark borders to light borders
  { from: /border:\s*["']1px solid rgba\(255,\s*255,\s*255,\s*0\.[0-9]+.*?\)/g, to: 'border: "1px solid var(--border)"' },
  
  // 4. Box shadows dark glow -> light shadow
  { from: /boxShadow:\s*["']0 [0-9]+px [0-9]+px rgba\(124,\s*58,\s*237,\s*0\.[0-9]+\).*?["']/g, to: 'boxShadow: "var(--shadow-md)"' },
  { from: /boxShadow:\s*["']0 [0-9]+px [0-9]+px rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\).*?["']/g, to: 'boxShadow: "var(--shadow-md)"' },
];

let modifiedCount = 0;

targetFiles.forEach(file => {
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
