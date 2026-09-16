const fs = require('fs');

const pathDrawer = 'd:\\Projects\\link-office\\src\\components\\superadmin\\IrisDrawer.tsx';
let contentDrawer = fs.readFileSync(pathDrawer, 'utf8');

// Replace the violet header with admin-style header
contentDrawer = contentDrawer.replace(
  /background: "linear-gradient\(135deg, #6366f1 0%, #a855f7 100%\)", color: "white"/g,
  'background: "var(--surface)", borderBottom: "1px solid var(--border)", color: "var(--text-1)"'
);

// Fix the close button in the header
contentDrawer = contentDrawer.replace(
  /<button onClick=\{onClose\} style=\{\{ background: "transparent", border: "none", color: "white"/g,
  '<button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-3)"'
);

// Fix the BrainCircuit icon in the header
contentDrawer = contentDrawer.replace(
  /<div style=\{\{ width: 40, height: 40, borderRadius: "50%", background: "var\(--border-strong\)", display: "flex", alignItems: "center", justifyContent: "center" \}\}>\s*<BrainCircuit size=\{24\} \/>/g,
  `<div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BrainCircuit size={24} color="var(--primary)" />`
);

// Fix the buttons / texts
contentDrawer = contentDrawer.replaceAll('#6366f1', 'var(--primary)');
contentDrawer = contentDrawer.replaceAll('rgba(99,102,241,0.05)', 'rgba(0,169,157,0.05)');
contentDrawer = contentDrawer.replaceAll('rgba(99,102,241,0.1)', 'rgba(0,169,157,0.1)');

fs.writeFileSync(pathDrawer, contentDrawer);

const pathWidget = 'd:\\Projects\\link-office\\src\\components\\iris\\IrisWidget.tsx';
let contentWidget = fs.readFileSync(pathWidget, 'utf8');

// Change widget background from hardcoded white to var(--surface)
contentWidget = contentWidget.replace(
  /background: "rgba\(255,255,255,0\.95\)"/g,
  'background: "var(--surface)"'
);

fs.writeFileSync(pathWidget, contentWidget);

console.log("Fixed Iris colors");
