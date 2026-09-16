const fs = require('fs');
const b2gPath = 'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx';
let b2gContent = fs.readFileSync(b2gPath, 'utf8');

const b2gBtnStart = b2gContent.indexOf('<div style={{ display: "flex", gap: 12 }}>');
if (b2gBtnStart !== -1) {
  const b2gBtnEnd = b2gContent.indexOf('</div>', b2gBtnStart) + 6;
  const b2gNewBtns = `<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard/b2g/campaigns" className="btn btn-secondary btn-sm">
                Gérer les campagnes
              </Link>
              <Link href="/dashboard/b2g/actions" className="btn btn-primary btn-sm">
                Plan d'action
              </Link>
            </div>`;
  b2gContent = b2gContent.substring(0, b2gBtnStart) + b2gNewBtns + b2gContent.substring(b2gBtnEnd);
}

fs.writeFileSync(b2gPath, b2gContent);
console.log('Fixed b2g buttons');
