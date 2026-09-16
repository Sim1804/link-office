const fs = require('fs');

const files = [
  'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx',
  'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx'
];

files.forEach(targetPath => {
  let content = fs.readFileSync(targetPath, 'utf8');

  // Text colors
  content = content.replaceAll('color: "#f8fafc"', 'color: "var(--text-1)"');
  content = content.replaceAll('color: "#94a3b8"', 'color: "var(--text-2)"');
  content = content.replaceAll('color: "#64748b"', 'color: "var(--text-3)"');
  content = content.replaceAll('color: "#38bdf8"', 'color: "var(--primary)"');
  content = content.replaceAll('color: "#34d399"', 'color: "var(--primary)"'); // If they use green, maybe keep it green or use primary. Let's keep it mostly as is for specific chart colors.
  
  // Backgrounds and borders
  content = content.replaceAll('background: "rgba(30,41,59,0.8)"', 'background: "var(--surface)", boxShadow: "var(--shadow-card)"');
  content = content.replaceAll('background: "rgba(15,23,42,0.6)"', 'background: "var(--surface)", boxShadow: "var(--shadow-card)"');
  content = content.replaceAll('border: "1px solid rgba(255,255,255,0.05)"', 'border: "1px solid var(--border)"');
  content = content.replaceAll('borderBottom: "1px solid rgba(255,255,255,0.05)"', 'borderBottom: "1px solid var(--border)"');
  content = content.replaceAll('background: "rgba(255,255,255,0.05)"', 'background: "var(--bg)"');
  content = content.replaceAll('border: "1px solid rgba(255,255,255,0.08)"', 'border: "1px solid var(--border)"');
  
  // Tabs switcher
  content = content.replaceAll(
    'background: "rgba(17,24,39,0.5)", padding: 4, borderRadius: 12, width: "fit-content"',
    'background: "var(--surface)", padding: 6, borderRadius: 12, border: "1px solid var(--border)", width: "fit-content"'
  );
  content = content.replaceAll(
    'background: activeTab === key ? "var(--primary, #7c3aed)" : "transparent",',
    'background: activeTab === key ? "var(--primary)" : "transparent",'
  );
  content = content.replaceAll(
    'background: activeTab === key ? "rgba(16,185,129,0.2)" : "transparent"',
    'background: activeTab === key ? "var(--primary)" : "transparent"'
  );
  content = content.replaceAll(
    'color: activeTab === key ? "#34d399" : "#94a3b8"',
    'color: activeTab === key ? "white" : "var(--text-2)"'
  );
  content = content.replaceAll(
    'color: activeTab === key ? "white" : "#94a3b8",',
    'color: activeTab === key ? "white" : "var(--text-2)",'
  );
  content = content.replaceAll(
    'boxShadow: activeTab === key ? "0 0 16px rgba(124,58,237,0.3)" : "none",',
    'boxShadow: activeTab === key ? "var(--shadow-glow-cyan)" : "none",'
  );

  // Additional specific fixes
  content = content.replaceAll('background: "rgba(16,185,129,0.08)"', 'background: "var(--bg)"'); // Some card header
  content = content.replaceAll('borderBottom: "1px solid rgba(255,255,255,0.03)"', 'borderBottom: "1px solid var(--border)"');

  // Replace native selects with our custom Select if we can, or just style them properly.
  // We have a custom Select in "@/components/ui/Select", but since these files might be large and complex, 
  // styling them with 'input-field' class is safer as a fallback.
  content = content.replaceAll(
    'style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f8fafc", padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none", height: 36 }}',
    'className="input-field" style={{ height: 36, padding: "8px 12px", width: "auto" }}'
  );
  content = content.replaceAll(
    'style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f8fafc", padding: "10px 14px", borderRadius: 10, fontSize: 14, outline: "none" }}',
    'className="input-field"'
  );
  content = content.replaceAll(
    'style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#94a3b8", fontSize: 13, cursor: "pointer", transition: "all 0.2s", height: 36 }}',
    'className="btn btn-secondary btn-sm" style={{ height: 36 }}'
  );

  fs.writeFileSync(targetPath, content);
  console.log(`Refactored colors for ${targetPath}`);
});
