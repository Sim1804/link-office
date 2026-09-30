import { prisma } from "./src/lib/prisma";

async function updateDb() {
    console.log("Mise à jour des micro-défis dans la base de données...");
    
    // Récupérer tous les micro-défis
    const defis = await prisma.libraryItem.findMany({
        where: { library: "Micro-défis" }
    });
    
    let updated = 0;
    
    for (const defi of defis) {
        const data = defi.data as any;
        const dim = data.dimension_ciblee || data.dimensions_ciblees || '';
        
        if (dim === 'Parentalité/Aidance') {
            // Mettre à jour la dimension
            if (data.dimension_ciblee) data.dimension_ciblee = 'Relations affectives';
            if (data.dimensions_ciblees) data.dimensions_ciblees = 'Relations affectives';
            
            // Mettre à jour les publics cibles
            let publics = data.public_cible ? data.public_cible.split(';').map((s: string) => s.trim()) : [];
            if (!publics.includes('Parent')) publics.push('Parent');
            if (!publics.includes('Aidant familial')) publics.push('Aidant familial');
            if (!publics.includes('Famille monoparentale')) publics.push('Famille monoparentale');
            
            data.public_cible = publics.join(';');
            
            // Sauvegarder en BDD
            await prisma.libraryItem.update({
                where: { id: defi.id },
                data: { data }
            });
            updated++;
        }
    }
    
    console.log(`✅ Base de données mise à jour : ${updated} éléments corrigés.`);
    await prisma.$disconnect();
}

updateDb().catch(console.error);
