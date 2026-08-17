const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../Documentation/Bibliotheques_LINK_OFFICE_V1.csv');
const jsonPath = path.join(__dirname, '../prisma/link-office-library.json');

// Read and parse file
const fileContent = fs.readFileSync(csvPath, 'utf8');
const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const headers = lines[0].split(';');

const recommendations = [];

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
    if (headers[j] === 'impact_attendu_1_5') {
      val = val ? parseInt(val, 10) : null;
    }
    obj[headers[j]] = val;
  }
  
  if (obj.recommendation_id && obj.titre) {
    recommendations.push(obj);
  }
}

console.log(`Parsed ${recommendations.length} recommendations from source.`);

// Update JSON
const libraryJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
libraryJson.Recommandations = recommendations;

fs.writeFileSync(jsonPath, JSON.stringify(libraryJson, null, 2), 'utf8');
console.log('Successfully updated prisma/link-office-library.json');
