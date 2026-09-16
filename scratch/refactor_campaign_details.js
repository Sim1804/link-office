const fs = require('fs');

function refactorCampaignPage(filepath, type) {
  if (!fs.existsSync(filepath)) {
    console.log(`File not found: ${filepath}`);
    return;
  }
  let content = fs.readFileSync(filepath, 'utf8');

  // Background colors
  content = content.replace(/background:"rgba\(15,23,42,0\.7\)"/g, 'background:"var(--surface-2)"');
  content = content.replace(/background:"#111827"/g, 'background:"var(--surface)"');
  content = content.replace(/background:"rgba\(255,255,255,0\.025\)"/g, 'background:"var(--surface-2)"');
  content = content.replace(/background:"rgba\(255,255,255,0\.04\)"/g, 'background:"var(--surface-2)"');
  content = content.replace(/background:"#f8fafc"/g, 'background:"var(--surface-2)"'); // specific to QR code bg

  // Text colors
  content = content.replace(/color:"#f8fafc"/g, 'color:"var(--text-1)"');
  content = content.replace(/color:"#cbd5e1"/g, 'color:"var(--text-2)"');
  content = content.replace(/color:"#94a3b8"/g, 'color:"var(--text-2)"');
  content = content.replace(/color:"#64748b"/g, 'color:"var(--text-3)"');
  content = content.replace(/color:"#475569"/g, 'color:"var(--text-3)"');
  content = content.replace(/color:"#1a0533"/g, 'color:"var(--text-1)"'); // specific to QR code text

  // Borders
  content = content.replace(/border:"1px solid rgba\(255,255,255,0\.06\)"/g, 'border:"1px solid var(--border)"');
  content = content.replace(/border:"1px solid rgba\(255,255,255,0\.04\)"/g, 'border:"1px solid var(--border)"');
  content = content.replace(/borderBottom:"1px solid rgba\(255,255,255,0\.06\)"/g, 'borderBottom:"1px solid var(--border)"');
  content = content.replace(/borderBottom:"1px solid rgba\(255,255,255,0\.04\)"/g, 'borderBottom:"1px solid var(--border)"');
  content = content.replace(/stroke="rgba\(255,255,255,0\.06\)"/g, 'stroke="var(--border)"');

  // Input fields
  content = content.replace(/className="input-field"/g, 'className="input-field" style={{ background:"var(--surface)", color:"var(--text-1)", border:"1px solid var(--border)", padding:"12px 16px", borderRadius:12 }}');

  // Charts colors - Tooltip background
  content = content.replace(/background:"#111827", border:"1px solid var\(--border\)", borderRadius:8/g, 'background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text-1)"');

  // Tabs style adjustment
  content = content.replace(/background: isActive \? "rgba\(124,58,237,0\.15\)" : "transparent"/g, 'background: isActive ? "rgba(124,58,237,0.1)" : "transparent"');

  // The radar chart and other SVG text colors:
  content = content.replace(/fill:"#64748b"/g, 'fill:"var(--text-3)"');

  // Progress Bar container background (optional, they usually rely on global css now, but if inline)
  content = content.replace(/background:"rgba\(18,61,70,0\.05\)"/g, 'background:"var(--surface-2)"');

  fs.writeFileSync(filepath, content);
  console.log(`Refactored ${type} campaign details: ${filepath}`);
}

refactorCampaignPage('d:\\Projects\\link-office\\app\\dashboard\\rh\\campaigns\\[id]\\page.tsx', 'RH');
refactorCampaignPage('d:\\Projects\\link-office\\app\\dashboard\\b2b2c\\campaigns\\[id]\\page.tsx', 'B2B2C');
refactorCampaignPage('d:\\Projects\\link-office\\app\\dashboard\\b2g\\campaigns\\[id]\\page.tsx', 'B2G');
