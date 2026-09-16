const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(filepath);
      }
    }
  });
  return filelist;
}

function fixDoubleQuotes(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  content = content.replace(/""var\(--/g, '"var(--');
  content = content.replace(/--\)""/g, '--)""'.replace(/""/g, '"')); 
  // wait, better:
  content = content.replace(/""var\((.*?)\)""/g, '"var($1)"');

  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`Fixed double quotes in ${filepath}`);
  }
}

const targetDirs = [
  'd:\\Projects\\link-office\\src\\components\\dashboard',
  'd:\\Projects\\link-office\\app\\mon-profil',
  'd:\\Projects\\link-office\\app\\dashboard'
];

targetDirs.forEach(dir => {
  const files = walkSync(dir);
  files.forEach(fixDoubleQuotes);
});
