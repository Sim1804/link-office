const fs = require('fs');
const db = require('./prisma/link-office-library.json');

const standardDimensions = [
    "Relations sociales",
    "Relations affectives",
    "Vie sentimentale",
    "Vie professionnelle et engagement",
    "Relation à soi et au sens"
];

function normalize(s) {
    if (!s) return '';
    return s.toLowerCase().trim();
}

function audit() {
    console.log("=== AUDIT DU CATALOGUE LINK OFFICE ===\n");
    
    for (const library of Object.keys(db)) {
        console.log(`\n--- Analyse de la librairie : ${library} ---`);
        const items = db[library];
        
        let missingDimensions = 0;
        let unknownDimensions = new Set();
        let wrongKeys = new Set();
        
        const dimensionsCount = {
            "Relations sociales": 0,
            "Relations affectives": 0,
            "Vie sentimentale": 0,
            "Vie professionnelle et engagement": 0,
            "Relation à soi et au sens": 0
        };

        for (const item of items) {
            // Check dimension keys
            const dimRaw = item.dimensions_iqrh || item.dimensions_ciblees || item.dimension_ciblee || item.Dimension || '';
            if (!dimRaw) {
                missingDimensions++;
                continue;
            }

            const dims = dimRaw.split(/[,;]/).map(d => d.trim()).filter(Boolean);
            for (const d of dims) {
                const normD = normalize(d);
                let found = false;
                if (normD.includes("social")) { dimensionsCount["Relations sociales"]++; found = true; }
                else if (normD.includes("affecti")) { dimensionsCount["Relations affectives"]++; found = true; }
                else if (normD.includes("sentimental")) { dimensionsCount["Vie sentimentale"]++; found = true; }
                else if (normD.includes("professionnel") || normD.includes("pro")) { dimensionsCount["Vie professionnelle et engagement"]++; found = true; }
                else if (normD.includes("soi")) { dimensionsCount["Relation à soi et au sens"]++; found = true; }
                
                if (!found && normD !== "toutes" && normD !== "tous" && normD !== "toutes les dimensions") {
                    unknownDimensions.add(d);
                }
            }

            // Check for wrong keys
            if (item.besoins_cibles) wrongKeys.add("besoins_cibles (devrait être besoins_couverts ou besoin_cible)");
            if (item.icr_cible) wrongKeys.add("icr_cible (mentionné mais non standardisé)");
            if (item.dimensions_iqh) wrongKeys.add("dimensions_iqh (typo ?)");
        }

        console.log(`Éléments analysés : ${items.length}`);
        console.log(`Éléments sans dimension précisée : ${missingDimensions}`);
        console.log(`Répartition par dimension officielle :`);
        for (const [dim, count] of Object.entries(dimensionsCount)) {
            console.log(`  - ${dim}: ${count} éléments`);
        }
        
        if (unknownDimensions.size > 0) {
            console.log(`⚠️ Dimensions non reconnues ou mal orthographiées :`);
            for (const ud of unknownDimensions) {
                console.log(`  - "${ud}"`);
            }
        }
        
        if (wrongKeys.size > 0) {
            console.log(`⚠️ Clés JSON incorrectes ou obsolètes détectées :`);
            for (const wk of wrongKeys) {
                console.log(`  - ${wk}`);
            }
        }
    }
}

audit();
