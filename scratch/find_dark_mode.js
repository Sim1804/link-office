const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const allFiles = [...walk('./app'), ...walk('./src')];
const targetFiles = allFiles.filter(f => !f.includes('superadmin') && !f.includes('.next') && !f.includes('node_modules'));

let issues = [];

targetFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Look for dark mode specific hardcoded colors
  if (content.includes('rgba(255,255,255') || content.includes('#fff') || content.includes('#000') || content.includes('color: "white"')) {
    issues.push(`[${file}] Contains hardcoded white/dark-mode colors (e.g. rgba(255,255,255,...), #fff).`);
  }
});

fs.writeFileSync('scratch/dark_mode_report.txt', issues.join('\n'));
console.log(`Found ${issues.length} files with potential dark mode hardcoded styles.`);
