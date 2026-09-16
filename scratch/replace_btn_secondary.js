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
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:\\Projects\\link-office\\app').concat(walk('d:\\Projects\\link-office\\src'));
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('btn-secondary')) {
    content = content.replace(/btn-secondary/g, 'btn-tertiary');
    fs.writeFileSync(file, content);
    count++;
  }
});

console.log(`Replaced in ${count} files.`);
