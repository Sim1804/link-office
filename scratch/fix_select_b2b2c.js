const fs = require('fs');

const files = [
  'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx',
  'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx'
];

files.forEach(targetPath => {
  let content = fs.readFileSync(targetPath, 'utf8');

  // Replace native <select> block with className="input-field" if we just need it styled natively like rh.
  // The block in b2b2c/page.tsx:
  // <select 
  //   value={selectedCampaignId} 
  //   onChange={(e) => setSelectedCampaignId(e.target.value)}
  //   className="input-field" style={{ height: 36, padding: "8px 12px", width: "auto" }}
  // >
  // Or the original dark mode:
  //   style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f8fafc", padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none", height: 36 }}
  // >
  
  content = content.replace(
    'style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f8fafc", padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none", height: 36 }}',
    'className="input-field" style={{ width: "auto", padding: "8px 36px 8px 12px", borderRadius: 8, height: 36 }}'
  );

  content = content.replace(
    'style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f8fafc", padding: "10px 14px", borderRadius: 10, fontSize: 14, outline: "none" }}',
    'className="input-field" style={{ width: "auto", padding: "8px 36px 8px 12px", borderRadius: 8 }}'
  );

  fs.writeFileSync(targetPath, content);
  console.log(`Fixed selects in ${targetPath}`);
});
