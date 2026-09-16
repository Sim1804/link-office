const fs = require('fs');

const files = [
  'd:\\Projects\\link-office\\app\\dashboard\\rh\\campaigns\\[id]\\page.tsx',
  'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\campaigns\\[id]\\page.tsx',
  'd:\\Projects\\link-office\\app\\dashboard\\b2g\\campaigns\\[id]\\page.tsx'
];

files.forEach(filepath => {
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/ style=\{\{ background:"var\(--surface\)", color:"var\(--text-1\)", border:"1px solid var\(--border\)", padding:"12px 16px", borderRadius:12 \}\}/g, '');
    fs.writeFileSync(filepath, content);
    console.log(`Cleaned ${filepath}`);
  }
});
