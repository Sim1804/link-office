const fs = require('fs');

const b2gPath = 'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx';
let content = fs.readFileSync(b2gPath, 'utf8');

if (!content.includes('import { PartnerPortalsNavigation }')) {
  content = content.replace(
    'import { Navbar } from "@/components/layout/Navbar";',
    'import { Navbar } from "@/components/layout/Navbar";\nimport { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";'
  );
  fs.writeFileSync(b2gPath, content);
  console.log('Added missing import to b2g!');
} else {
  console.log('Import already exists.');
}
