const fs = require('fs');
const path = require('path');

const targetDirs = [
  'd:\\Projects\\link-office\\app\\dashboard\\rh\\campaigns',
  'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\campaigns',
  'd:\\Projects\\link-office\\app\\dashboard\\b2g\\campaigns'
];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

let allFiles = [];
targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(getAllFiles(dir));
  }
});

console.log("Target files:");
allFiles.forEach(f => console.log(f));

// Let's create a regex/logic to inject PartnerPortalsNavigation
// We look for `<main className="page-main">` and add `<PartnerPortalsNavigation />` right after it
// We also need to add the import: `import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";`
// We also need to add the import `import Link from "next/link";` just in case since we are here (not strictly necessary but safe).

allFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (!content.includes('<PartnerPortalsNavigation />')) {
    // Inject component
    const mainTagMatch = content.match(/<main[^>]*className=["'][^"']*page-main[^"']*["'][^>]*>/);
    if (mainTagMatch) {
      const mainTag = mainTagMatch[0];
      content = content.replace(mainTag, `${mainTag}\n        <PartnerPortalsNavigation />`);
      changed = true;
    } else {
      // Fallback: look for `<main>` or `<div className="page-main">`
      const mainTag = content.match(/<main[^>]*>/);
      if (mainTag) {
        content = content.replace(mainTag[0], `${mainTag[0]}\n        <PartnerPortalsNavigation />`);
        changed = true;
      }
    }
  }

  if (changed && !content.includes('PartnerPortalsNavigation"')) {
    // Add import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.substring(0, endOfLine) + '\nimport { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";' + content.substring(endOfLine);
    } else {
      // No imports at all? Just add at top.
      content = 'import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";\n' + content;
    }
  }

  // Also clean dark mode colors while we're at it
  content = content.replaceAll('color: "#f8fafc"', 'color: "var(--text-1)"');
  content = content.replaceAll('color: "#94a3b8"', 'color: "var(--text-2)"');
  content = content.replaceAll('color: "#64748b"', 'color: "var(--text-3)"');
  content = content.replaceAll('background: "rgba(17,24,39,0.5)"', 'background: "var(--surface)"');
  content = content.replaceAll('background: "rgba(30,41,59,0.8)"', 'background: "var(--surface)", boxShadow: "var(--shadow-card)"');
  content = content.replaceAll('background: "rgba(15,23,42,0.6)"', 'background: "var(--surface)", boxShadow: "var(--shadow-card)"');
  content = content.replaceAll('rgba(255,255,255,0.05)', 'var(--bg)');
  content = content.replaceAll('rgba(255,255,255,0.03)', 'var(--bg)');
  content = content.replaceAll('rgba(255,255,255,0.1)', 'var(--bg)');
  content = content.replaceAll('rgba(255,255,255,0.08)', 'var(--border)');

  if (changed || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});
