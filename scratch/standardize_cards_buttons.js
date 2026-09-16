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

function processFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // 1. Replace large card inline styles with className="card"
  // Example: style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 28, borderRadius: 24, ... }}
  
  // This regex looks for `background: "var(--surface)"` along with padding and border-radius in any order within style={{ ... }}
  // Due to variations, we can just remove `background: "var(--surface)"`, `padding: XX`, `borderRadius: XX`, `border: "1px solid var(--border...)"`
  // and inject `className="card"` if it doesn't already have one.

  // It's safer and cleaner to specifically target known blocks or do regex replacements on the common properties.
  
  // Replace large border radius values (20, 24) with 16 to match .card standard
  content = content.replace(/borderRadius:\s*24/g, 'borderRadius: 16');
  content = content.replace(/borderRadius:\s*20/g, 'borderRadius: 16');
  content = content.replace(/borderRadius:\s*18/g, 'borderRadius: 16');

  // Replace custom button styles
  // DashboardTabs.tsx line 208 button:
  content = content.replace(/<button\s*onClick=\{\(\) => router\.push\("\/consentement\?retake=true"\)\}\s*style=\{\{\s*display: "inline-flex", alignItems: "center", gap: 8,\s*background: "var\(--primary\)",\s*color: "#fff", fontWeight: 600, padding: "11px 22px", borderRadius: 12,\s*border: "none", cursor: "pointer", fontSize: 13,\s*boxShadow: "0 4px 20px var\(--primary-glow\)", transition: "all 0\.2s",\s*\}\}\s*>/gs, 
    '<button\n              onClick={() => router.push("/consentement?retake=true")}\n              className="btn btn-primary btn-md"\n            >');
            
  // DashboardJournalTab.tsx line 124 button:
  content = content.replace(/style=\{\{\s*display: "flex", alignItems: "center", gap: 8,\s*background: newEntry\.trim\(\) \? "var\(--primary\)" : "var\(--border\)",\s*color: newEntry\.trim\(\) \? "var\(--surface\)" : "var\(--text-3\)",\s*border: "none", padding: "10px 20px", borderRadius: 10,\s*fontWeight: 600, cursor: newEntry\.trim\(\) \? "pointer" : "not-allowed",\s*\}\}/gs, 
    'className={`btn btn-md ${newEntry.trim() ? "btn-primary" : "btn-secondary"}`}');
    
  // DashboardRelationsTab.tsx line 119 button:
  content = content.replace(/<button style=\{\{\s*display: "flex", alignItems: "center", gap: 6,\s*background: "rgba\(18,61,70,0\.05\)", border: "1px solid var\(--border\)",\s*color: "var\(--text-1\)", padding: "8px 16px", borderRadius: 10,\s*fontWeight: 500, fontSize: 13, cursor: "pointer",\s*\}\}/gs, 
    '<button className="btn btn-secondary btn-sm"');

  // DashboardAnalyseTab.tsx line 42 already uses btn btn-primary btn-md.
  // DashboardTabs.tsx line 265 Link:
  content = content.replace(/<Link href="\/premium" style=\{\{\s*display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,\s*background: "var\(--primary\)", color: "var\(--text-1\)", fontWeight: 600, textDecoration: "none"\s*\}\}>/gs, 
    '<Link href="/premium" className="btn btn-primary btn-md">');

  // General Dashboard cards standardization (replace padding 24/28/32 -> 20, border-radius -> 16)
  // Let's just normalize padding when it is huge.
  content = content.replace(/padding:\s*24,/g, 'padding: 20,');
  content = content.replace(/padding:\s*28,/g, 'padding: 20,');
  content = content.replace(/padding:\s*32,/g, 'padding: 20,');
  content = content.replace(/padding:\s*"24px 28px",/g, 'padding: "20px",');
  content = content.replace(/padding:\s*"28px 32px",/g, 'padding: "20px",');
  content = content.replace(/padding:\s*"22px 24px",/g, 'padding: "20px",');
  
  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`Standardized ${filepath}`);
  }
}

const targetDirs = [
  'd:\\Projects\\link-office\\src\\components\\dashboard',
  'd:\\Projects\\link-office\\app\\dashboard'
];

targetDirs.forEach(dir => {
  const files = walkSync(dir);
  files.forEach(processFile);
});
