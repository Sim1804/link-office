import { performance } from "perf_hooks";
import fs from "fs";
import { prisma } from "../../src/lib/prisma";

async function reproduceP1Burst(concurrency = 100, poolTimeoutMs = 2000): Promise<{
  concurrency: number;
  total: number;
  success: number;
  errors: number;
  errorRate: number;
  errorTypes: Record<string, number>;
}> {
  console.log(`\n--- Reproduction P1 : Rafale instantanée de ${concurrency} transactions concurrentes (Promise.all) ---`);
  
  // Création de 100 promesses simultanées demandant chacune une transaction interactive
  const tasks: Promise<{ success: boolean; error?: string }>[] = [];
  const errorTypes: Record<string, number> = {};

  for (let i = 0; i < concurrency; i++) {
    tasks.push(
      (async () => {
        try {
          await prisma.$transaction(
            async (tx) => {
              // Simuler une transaction interactive multi-étapes avec un délai de traitement de 50ms
              await tx.$queryRawUnsafe('SELECT 1');
              await new Promise((resolve) => setTimeout(resolve, 50));
              await tx.$queryRawUnsafe('SELECT 2');
            },
            {
              timeout: 10000,
              maxWait: poolTimeoutMs, // Contrainte forte sur l'attente du pool
            }
          );
          return { success: true };
        } catch (err: any) {
          const errMsg = err?.message?.includes("Timed out")
            ? "PoolTimeout"
            : err?.code || "OtherError";
          return { success: false, error: errMsg };
        }
      })()
    );
  }

  const results = await Promise.all(tasks);
  const success = results.filter((r) => r.success).length;
  const errors = results.filter((r) => !r.success).length;
  results.forEach((r) => {
    if (r.error) {
      errorTypes[r.error] = (errorTypes[r.error] || 0) + 1;
    }
  });

  return {
    concurrency,
    total: concurrency,
    success,
    errors,
    errorRate: parseFloat(((errors / concurrency) * 100).toFixed(1)),
    errorTypes,
  };
}

async function reproduceP2Paced(totalRequests = 100, concurrency = 10): Promise<{
  total: number;
  success: number;
  errors: number;
  errorRate: number;
}> {
  console.log(`\n--- Reproduction P2 : Charge cadencée (70% lectures, 20% soumissions, 10% écritures légères) ---`);
  
  let success = 0;
  let errors = 0;
  const queue = Array.from({ length: totalRequests }, (_, idx) => {
    const roll = idx % 10;
    if (roll < 7) return "READ";
    if (roll < 9) return "SUBMISSION";
    return "LIGHT_WRITE";
  });

  // Exécution avec pool de workers limités (concurrence maîtrisée avec pacing)
  let currentIndex = 0;
  async function worker() {
    while (currentIndex < queue.length) {
      const idx = currentIndex++;
      const type = queue[idx];
      try {
        if (type === "READ") {
          await prisma.user.findFirst({ select: { id: true } });
        } else if (type === "LIGHT_WRITE") {
          await prisma.$queryRawUnsafe('SELECT 1');
        } else {
          // Soumission cadencée
          await prisma.$transaction(async (tx) => {
            await tx.$queryRawUnsafe('SELECT 1');
          });
        }
        success++;
      } catch (err) {
        errors++;
      }
      // Pacing léger
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return {
    total: totalRequests,
    success,
    errors,
    errorRate: parseFloat(((errors / totalRequests) * 100).toFixed(1)),
  };
}

async function main() {
  console.log("=== REPRODUCTION ET DÉPARTAGE DE LA CONTRADICTION P1 / P2 (TÂCHE B4) ===");

  const p1Rep = await reproduceP1Burst(100, 1500);
  console.log("Résultat Reproduction P1 :", p1Rep);

  const p2Rep = await reproduceP2Paced(200, 10);
  console.log("Résultat Reproduction P2 :", p2Rep);

  fs.mkdirSync("audit11/raw", { recursive: true });
  fs.writeFileSync(
    "audit11/raw/B4_reproduction.json",
    JSON.stringify({ p1Reproduction: p1Rep, p2Reproduction: p2Rep }, null, 2),
    "utf8"
  );
  console.log("\n✓ Données brutes enregistrées dans audit11/raw/B4_reproduction.json");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
