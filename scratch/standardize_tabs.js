const fs = require('fs');

function fixTabs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the tabs container
  // For b2b2c: <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "var(--surface)", padding: 6, borderRadius: 12, border: "1px solid var(--border)", width: "fit-content" }}>
  // For b2g: same?
  content = content.replace(
    /background: "var\(--surface\)", padding: 6, borderRadius: 12, border: "1px solid var\(--border\)"/,
    'background: "var(--bg)", padding: 4, borderRadius: 9999, border: "1px solid var(--border)"'
  );
  
  // Find the buttons inside the tabs
  // <button ... style={{ ... borderRadius: 8, ... }}
  content = content.replaceAll(
    'padding: "8px 16px", borderRadius: 8, border: "none",',
    'padding: "8px 16px", borderRadius: 9999, border: "none",'
  );
  
  content = content.replaceAll(
    'color: activeTab === key ? "white" : "var(--text-2)",',
    'color: activeTab === key ? "white" : "var(--text-2)",'
  );
  
  // Let's ensure active tab gets the right box shadow
  content = content.replaceAll(
    'boxShadow: activeTab === key ? "var(--shadow-glow-cyan)" : "none",',
    'boxShadow: activeTab === key ? "0 2px 8px rgba(18,61,70,0.1)" : "none",'
  );

  fs.writeFileSync(filePath, content);
}

fixTabs('d:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx');
fixTabs('d:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx');
console.log('Fixed tabs!');
