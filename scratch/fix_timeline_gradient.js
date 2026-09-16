const fs = require('fs');

let tabsPath = 'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardTabs.tsx';
let tabsContent = fs.readFileSync(tabsPath, 'utf8');

// Fix timeline item card background
tabsContent = tabsContent.replace(
  /background: isLatest\s*\?\s*"linear-gradient\(135deg, rgba\(124,58,237,0\.08\) 0%, var\(--surface\) 100%\)"\s*:\s*"var\(--surface\)",/gs,
  `background: isLatest
                  ? "linear-gradient(135deg, rgba(0,169,157,0.08) 0%, var(--surface) 100%)"
                  : "var(--surface)",`
);

// Fix timeline item card border
tabsContent = tabsContent.replace(
  /border: isLatest\s*\?\s*"1px solid rgba\(124,58,237,0\.2\)"\s*:\s*"1px solid rgba\(18,61,70,0\.05\)",/gs,
  `border: isLatest
                  ? "1px solid rgba(0,169,157,0.2)"
                  : "1px solid var(--border)",`
);

fs.writeFileSync(tabsPath, tabsContent);
console.log('Fixed DashboardTabs.tsx timeline card');
