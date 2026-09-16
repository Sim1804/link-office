const fs = require('fs');

// B2G Page
const b2gPath = 'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx';
let b2gContent = fs.readFileSync(b2gPath, 'utf8');

// Replace MapPin container
const b2gMapPinStart = b2gContent.indexOf('<div style={{ width: 52, height: 52, background: "rgba(6,182,212,0.12)"');
if (b2gMapPinStart !== -1) {
  const b2gMapPinEnd = b2gContent.indexOf('</div>', b2gMapPinStart) + 6;
  b2gContent = b2gContent.substring(0, b2gMapPinStart) + 
    '<div style={{ width: 52, height: 52, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>\n                <MapPin style={{ width: 26, height: 26, color: "white" }} />\n              </div>' + 
    b2gContent.substring(b2gMapPinEnd);
}

fs.writeFileSync(b2gPath, b2gContent);
console.log('Fixed b2g icon container');

// B2B2C Page
const b2b2cPath = 'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx';
let b2b2cContent = fs.readFileSync(b2b2cPath, 'utf8');

// Replace ShieldCheck container
const shieldStart = b2b2cContent.indexOf('<div style={{ width: 52, height: 52, background: "rgba(0,169,157,0.1)"');
if (shieldStart !== -1) {
  const shieldEnd = b2b2cContent.indexOf('</div>', shieldStart) + 6;
  b2b2cContent = b2b2cContent.substring(0, shieldStart) + 
    '<div style={{ width: 52, height: 52, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>\n                <ShieldCheck style={{ width: 26, height: 26, color: "white" }} />\n              </div>' + 
    b2b2cContent.substring(shieldEnd);
}

fs.writeFileSync(b2b2cPath, b2b2cContent);
console.log('Fixed b2b2c icon container');
