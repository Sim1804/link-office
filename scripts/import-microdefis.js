const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../Documentation/Microdefis_LINK_OFFICE_V1.csv');
const jsonPath = path.join(__dirname, '../prisma/link-office-library.json');

// Read and parse file
const fileContent = fs.readFileSync(csvPath, 'utf8');
const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const headers = lines[0].split(';');

const defis = [];

for (let i = 1; i < lines.length; i++) {
  let row = [];
  let inQuotes = false;
  let currentVal = '';
  for (let c = 0; c < lines[i].length; c++) {
    const char = lines[i][c];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      row.push(currentVal);
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  row.push(currentVal);

  const obj = {};
  for (let j = 0; j < headers.length; j++) {
    if (!headers[j]) continue;
    let val = row[j] !== undefined ? row[j].trim() : '';
    // Parsing integers if needed
    if (headers[j] === 'points') {
      val = val ? parseInt(val, 10) : 50; // default 50 points if not provided
    }
    obj[headers[j]] = val;
  }
  
  if (obj.micro_defi_id && obj.titre) {
    defis.push(obj);
  }
}

console.log(`Parsed ${defis.length} micro-défis from source.`);

// Update JSON
const libraryJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
libraryJson['Micro-défis'] = defis;

fs.writeFileSync(jsonPath, JSON.stringify(libraryJson, null, 2), 'utf8');
console.log('Successfully updated prisma/link-office-library.json with Micro-défis');
