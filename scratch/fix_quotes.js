const fs = require('fs');
const path = require('path');

const reportFile = path.join(__dirname, 'dark_mode_report.txt');
const lines = fs.readFileSync(reportFile, 'utf8').split('\n');

const files = lines
  .filter(line => line.startsWith('['))
  .map(line => {
    const match = line.match(/\[(.*?)\]/);
    return match ? match[1] : null;
  })
  .filter(Boolean);

let modifiedCount = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Fix the double quote issue introduced by my previous regex
  content = content.replace(/var\(--surface\)""/g, 'var(--surface)"');
  content = content.replace(/var\(--border\)""/g, 'var(--border)"');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed double quotes in ${file}`);
    modifiedCount++;
  }
});

console.log(`\nFixed ${modifiedCount} files.`);
