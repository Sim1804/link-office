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

const allFiles = [
  ...walk('./app/dashboard/superadmin'),
  ...walk('./src/components/superadmin'),
  ...walk('./src/components/admin')
];

let issues = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for Next.js metadata in layout/page
  if (file.endsWith('page.tsx') || file.endsWith('layout.tsx')) {
    if (!content.includes('export const metadata') && !content.includes('"use client"')) {
      issues.push(`[${file}] Missing metadata export in server page/layout.`);
    }
    if (content.includes('"use client"') && content.includes('export const metadata')) {
      issues.push(`[${file}] Client component cannot export metadata.`);
    }
  }

  // Check for unhandled any
  const anyMatches = content.match(/: any/g);
  if (anyMatches && anyMatches.length > 0) {
    issues.push(`[${file}] Contains ${anyMatches.length} explicit 'any' types.`);
  }

  // Check for inline styles that could be extracted
  const styleMatches = content.match(/style={{/g);
  if (styleMatches && styleMatches.length > 10) {
    issues.push(`[${file}] Contains ${styleMatches.length} inline styles, consider CSS classes.`);
  }

  // Check for console.log
  if (content.includes('console.log')) {
    issues.push(`[${file}] Contains console.log statements.`);
  }

  // Check for unused imports (basic heuristic)
  const importLines = content.split('\n').filter(line => line.startsWith('import '));
  importLines.forEach(line => {
    const match = line.match(/import\s+{([^}]+)}\s+from/);
    if (match) {
      const imports = match[1].split(',').map(s => s.trim());
      imports.forEach(imp => {
        const regex = new RegExp(`\\b${imp}\\b`, 'g');
        const count = (content.match(regex) || []).length;
        if (count === 1) { // Only the import statement itself
          issues.push(`[${file}] Potentially unused import: ${imp}`);
        }
      });
    }
  });
});

fs.writeFileSync('scratch/audit_report.txt', issues.join('\n'));
console.log(`Found ${issues.length} potential issues. Check scratch/audit_report.txt`);
