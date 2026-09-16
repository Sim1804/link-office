const fs = require('fs');

const targetPath = 'd:\\Projects\\link-office\\app\\dashboard\\superadmin\\leads\\page.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

if (!content.includes('import { Select } from "@/components/ui/Select";')) {
  const lastImportIndex = content.lastIndexOf('import ');
  const newlineAfterImport = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, newlineAfterImport + 1) + 'import { Select } from "@/components/ui/Select";\n' + content.slice(newlineAfterImport + 1);
}

const oldSelect = `<select value={campaignOffer} onChange={e => setCampaignOffer(e.target.value as any)} className="input-field" style={{ maxWidth: 300 }}>
                    <option value="PREMIUM">PREMIUM - Parcours Premium classique</option>
                    <option value="PREMIUM_PLUS">PREMIUM+ - Inclut Module Binôme Relationnel</option>
                  </select>`;

const newSelect = `<Select 
                    value={campaignOffer} 
                    onChange={(val) => setCampaignOffer(val as any)}
                    options={[
                      { value: "PREMIUM", label: "PREMIUM - Parcours Premium classique" },
                      { value: "PREMIUM_PLUS", label: "PREMIUM+ - Inclut Module Binôme Relationnel" }
                    ]}
                    style={{ width: 350 }} 
                  />`;

content = content.replace(oldSelect, newSelect);

fs.writeFileSync(targetPath, content);
console.log("Select Replaced");
