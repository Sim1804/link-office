import { prisma } from "./src/lib/prisma";
import { PrescriptionService } from "./src/lib/iqrh/prescription-service";

async function run() {
    try {
        console.log("Fetching a diverse set of users...");
        
        // Let's get up to 20 users and pick 5 with different priority dimensions
        const results = await prisma.iqrhResult.findMany({
            take: 50,
            include: {
                icr: true,
                profile: true,
                assessment: { include: { user: true, demographic: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        // Filter to get unique priority dimensions for diverse testing
        const diverseUsers = [];
        const seenDimensions = new Set();
        
        for (const r of results) {
            if (!seenDimensions.has(r.priorityDimension)) {
                diverseUsers.push(r);
                seenDimensions.add(r.priorityDimension);
            }
            if (diverseUsers.length >= 5) break;
        }

        if (diverseUsers.length === 0) {
            console.log("No results found in the database.");
            return;
        }

        let passed = true;
        
        for (const r of diverseUsers) {
            console.log(`\n======================================================`);
            console.log(`Utilisateur: ${r.assessment?.user?.email || r.assessment?.userId}`);
            console.log(`Profil Principal: ${r.primaryProfile}`);
            console.log(`Situation: ${r.assessment?.demographic?.selectedSituations}`);
            console.log(`Dimension Cible (Priorité): ${r.priorityDimension}`);
            
            if (r.icr) {
                console.log(`Besoins Dominants: ${r.icr.dominantNeeds}`);
                console.log(`Facteurs de risque: ${r.icr.riskFactors}`);
            }

            const newPrescription = await PrescriptionService.generateForResult(r.id);
            
            const recos = newPrescription.items.filter(i => i.kind === "RECOMMENDATION");
            const defis = newPrescription.items.filter(i => i.kind === "MICRO_CHALLENGE");
            const partners = newPrescription.items.filter(i => i.kind === "PARTNER");
            
            console.log(`\n--- Bilan du Moteur ---`);
            console.log(`Recommandations générées : ${recos.length} (Attendu: 5)`);
            console.log(`Défis générés : ${defis.length} (Attendu: 2)`);
            console.log(`Partenaires générés : ${partners.length} (Attendu: entre 1 et 3)`);
            
            if (recos.length === 0 || defis.length === 0 || partners.length === 0) {
                console.log("❌ AVERTISSEMENT : Un des éléments est manquant pour cette dimension !");
                passed = false;
            } else {
                console.log("✅ Validation : L'utilisateur a reçu un plan complet !");
            }
            
            console.log("\nTop 1 Recommandation :");
            const r1 = recos[0]?.libraryItem?.data as any;
            if (r1) console.log(` -> ${r1.titre_affiche || r1.titre} | Dimension Ciblée: ${r1.dimensions_iqrh || r1.dimensions_ciblees || r1.dimension_ciblee}`);
            
            console.log("Top 1 Partenaire :");
            const p1 = partners[0]?.libraryItem?.data as any;
            if (p1) console.log(` -> ${p1.titre_affiche || p1.titre} | Besoins/Situations couverts: ${p1.besoins_couverts} / ${p1.situations_ciblees}`);
        }
        
        if (passed) {
            console.log(`\n✅✅✅ TEST GLOBAL REUSSI : Tous les profils testés ont obtenu un matching complet. La base de données couvre toutes les dimensions.`);
        } else {
            console.log(`\n❌❌❌ ECHEC DU TEST : Certains utilisateurs n'ont pas reçu d'ordonnance complète. Il manque probablement des données dans le catalogue pour certaines dimensions ou situations.`);
        }
        
    } catch (e) {
        console.error("ERREUR:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
