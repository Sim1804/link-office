const fs = require('fs');

const files = [
  'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardAnalyseTab.tsx',
  'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardBilanTab.tsx'
];

files.forEach(filepath => {
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/"var\((.*?)\)""/g, '"var($1)"');
    fs.writeFileSync(filepath, content);
    console.log(`Cleaned extra quote in ${filepath}`);
  }
});
