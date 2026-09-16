const fs = require('fs');

const files = [
  'd:\\Projects\\link-office\\app\\dashboard\\rh\\page.tsx',
  'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx',
  'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add import if not present
  if (!content.includes('PartnerPortalsNavigation')) {
    const lastImportIndex = content.lastIndexOf('import ');
    const newlineAfterImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, newlineAfterImport + 1) + 'import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";\n' + content.slice(newlineAfterImport + 1);

    // Insert component after <main className="page-main">
    content = content.replace(
      '<main className="page-main">',
      '<main className="page-main">\n        <PartnerPortalsNavigation />'
    );

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Skipped ${file}`);
  }
});
