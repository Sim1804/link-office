const fs = require('fs');
const path = './prisma/link-office-library.json';
const db = JSON.parse(fs.readFileSync(path, 'utf8'));

let modifiedCount = 0;

for (const defi of db['Micro-défis']) {
    let dim = defi.dimension_ciblee || defi.dimensions_ciblees || '';
    
    if (dim === 'Parentalité/Aidance') {
        // 1. Assigner une dimension IQRH valide (ex: Relations affectives)
        if (defi.dimension_ciblee) {
            defi.dimension_ciblee = 'Relations affectives';
        } else if (defi.dimensions_ciblees) {
            defi.dimensions_ciblees = 'Relations affectives';
        }
        
        // 2. Déplacer dans les publics cibles avec les valeurs exactes du profil démographique
        let publics = defi.public_cible ? defi.public_cible.split(';').map(s => s.trim()) : [];
        
        // Ajouter les situations exactes gérées par le questionnaire
        if (!publics.includes('Parent')) publics.push('Parent');
        if (!publics.includes('Aidant familial')) publics.push('Aidant familial');
        if (!publics.includes('Famille monoparentale')) publics.push('Famille monoparentale');
        
        defi.public_cible = publics.join(';');
        
        modifiedCount++;
    }
}

// Sauvegarde du JSON corrigé
fs.writeFileSync(path, JSON.stringify(db, null, 2));
console.log(`Corrigé ${modifiedCount} micro-défis avec succès dans link-office-library.json !`);
