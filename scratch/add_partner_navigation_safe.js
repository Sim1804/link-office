const fs = require('fs');

const files = [
  'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx',
  'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add import safely at the top
  if (!content.includes('PartnerPortalsNavigation')) {
    content = content.replace(
      'import { useSession } from "next-auth/react";',
      'import { useSession } from "next-auth/react";\nimport { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";'
    );

    // Insert component after <main className="page-main">
    content = content.replace(
      '<main className="page-main">',
      '<main className="page-main">\n        <PartnerPortalsNavigation />'
    );

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
