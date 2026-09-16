const fs = require('fs');

const files = [
  'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardAnalyseTab.tsx',
  'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardBilanTab.tsx',
  'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardRelationsTab.tsx',
  'd:\\Projects\\link-office\\src\\components\\dashboard\\tabs\\DashboardOrdonnanceTab.tsx'
];

files.forEach(filepath => {
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');

    // Replace purple/violet colors with primary theme colors
    content = content.replace(/rgba\(124,58,237,0\.2\)/g, 'var(--border-strong)');
    content = content.replace(/rgba\(124,58,237,0\.12\)/g, 'var(--primary-glow)');
    content = content.replace(/rgba\(124,58,237,0\.1\)/g, 'var(--primary-glow)');
    content = content.replace(/#a78bfa/g, 'var(--primary)');
    content = content.replace(/#7c3aed/g, 'var(--primary)');
    content = content.replace(/#6d28d9/g, 'var(--primary)');

    // In DashboardRelationsTab, there's a button with rgba(18,61,70,0.05) which is fine for light mode 
    // secondary buttons, but I'll make sure the text color is correct.
    
    fs.writeFileSync(filepath, content);
    console.log(`Cleaned purples in ${filepath}`);
  }
});
