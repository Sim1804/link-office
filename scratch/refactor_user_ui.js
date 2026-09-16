const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(filepath);
      }
    }
  });
  return filelist;
}

function refactorFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Background colors
  content = content.replace(/background:\s*"rgba\(15,23,42,0\.7\)"/g, 'background: "var(--surface-2)"');
  content = content.replace(/background:\s*"rgba\(15,23,42,0\.9\)"/g, 'background: "var(--surface-2)"');
  content = content.replace(/background:\s*"#111827"/g, 'background: "var(--surface)"');
  content = content.replace(/background:\s*"#1e293b"/g, 'background: "var(--surface)"');
  content = content.replace(/background:\s*"rgba\(255,255,255,0\.025\)"/g, 'background: "var(--surface-2)"');
  content = content.replace(/background:\s*"rgba\(255,255,255,0\.04\)"/g, 'background: "var(--surface-2)"');
  content = content.replace(/background:\s*"rgba\(255,255,255,0\.03\)"/g, 'background: "var(--surface-2)"');
  content = content.replace(/background:\s*"rgba\(255,255,255,0\.08\)"/g, 'background: "var(--surface-2)"');
  content = content.replace(/background:\s*"rgba\(255,255,255,0\.015\)"/g, 'background: "var(--surface-2)"');
  content = content.replace(/background:\s*"rgba\(255,255,255,0\.06\)"/g, 'background: "var(--surface-2)"');
  content = content.replace(/background:\s*"rgba\(255,255,255,0\.02\)"/g, 'background: "var(--surface-2)"');
  content = content.replace(/background:\s*"rgba\(255,255,255,0\.01\)"/g, 'background: "var(--surface-2)"');

  // Text colors
  content = content.replace(/color:\s*"#f8fafc"/g, 'color: "var(--text-1)"');
  content = content.replace(/color:\s*"#f1f5f9"/g, 'color: "var(--text-1)"');
  content = content.replace(/color:\s*"#cbd5e1"/g, 'color: "var(--text-2)"');
  content = content.replace(/color:\s*"#94a3b8"/g, 'color: "var(--text-2)"');
  content = content.replace(/color:\s*"#64748b"/g, 'color: "var(--text-3)"');
  content = content.replace(/color:\s*"#475569"/g, 'color: "var(--text-3)"');

  // Borders
  content = content.replace(/border:\s*"1px solid rgba\(255,255,255,0\.06\)"/g, 'border: "1px solid var(--border)"');
  content = content.replace(/border:\s*"1px solid rgba\(255,255,255,0\.08\)"/g, 'border: "1px solid var(--border)"');
  content = content.replace(/border:\s*"1px solid rgba\(255,255,255,0\.04\)"/g, 'border: "1px solid var(--border)"');
  content = content.replace(/border:\s*"1px solid rgba\(255,255,255,0\.1\)"/g, 'border: "1px solid var(--border)"');
  content = content.replace(/borderBottom:\s*"1px solid rgba\(255,255,255,0\.06\)"/g, 'borderBottom: "1px solid var(--border)"');
  content = content.replace(/borderBottom:\s*"1px solid rgba\(255,255,255,0\.08\)"/g, 'borderBottom: "1px solid var(--border)"');
  content = content.replace(/borderTop:\s*"1px solid rgba\(255,255,255,0\.06\)"/g, 'borderTop: "1px solid var(--border)"');
  content = content.replace(/stroke="rgba\(255,255,255,0\.06\)"/g, 'stroke="var(--border)"');
  content = content.replace(/stroke="rgba\(255,255,255,0\.04\)"/g, 'stroke="var(--border)"');
  content = content.replace(/stroke="rgba\(255,255,255,0\.02\)"/g, 'stroke="var(--border)"');
  content = content.replace(/border:\s*"1px dashed rgba\(255,255,255,0\.07\)"/g, 'border: "1px dashed var(--border)"');

  // Tabs style adjustments (DashboardTabs)
  content = content.replace(/color: isActive \? "#fff" : "#64748b"/g, 'color: isActive ? "var(--primary)" : "var(--text-2)"');
  
  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`Refactored ${filepath}`);
  }
}

const targetDirs = [
  'd:\\Projects\\link-office\\app\\mon-profil',
  'd:\\Projects\\link-office\\app\\questionnaire',
  'd:\\Projects\\link-office\\app\\adaptive',
  'd:\\Projects\\link-office\\app\\dashboard', // Note: dashboard pages for partner were done, but dashboard/page.tsx needs doing
  'd:\\Projects\\link-office\\src\\components\\dashboard',
  'd:\\Projects\\link-office\\app\\resultats'
];

targetDirs.forEach(dir => {
  const files = walkSync(dir);
  files.forEach(refactorFile);
});
