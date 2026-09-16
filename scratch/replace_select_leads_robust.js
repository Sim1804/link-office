const fs = require('fs');

const path = 'd:\\Projects\\link-office\\app\\dashboard\\superadmin\\leads\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace select manually by finding indices to avoid \r\n issues
const selectStart = content.indexOf('<select value={campaignOffer}');
if (selectStart !== -1) {
  const selectEnd = content.indexOf('</select>', selectStart) + '</select>'.length;
  
  const newSelect = `<Select 
                    value={campaignOffer} 
                    onChange={(val) => setCampaignOffer(val as any)}
                    options={[
                      { value: "PREMIUM", label: "PREMIUM - Parcours Premium classique" },
                      { value: "PREMIUM_PLUS", label: "PREMIUM+ - Inclut Module Binôme Relationnel" }
                    ]}
                    style={{ width: 350 }} 
                  />`;
                  
  content = content.substring(0, selectStart) + newSelect + content.substring(selectEnd);
}

if (!content.includes('import { Select }')) {
  const lastImportIndex = content.lastIndexOf('import ');
  const newlineAfterImport = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, newlineAfterImport + 1) + 'import { Select } from "@/components/ui/Select";\n' + content.slice(newlineAfterImport + 1);
}

fs.writeFileSync(path, content);
console.log('Select replaced robustly!');
