import { prisma } from "../lib/prisma";
import { buildIrisContext } from "../lib/iris/context-builder";

async function main() {
  const user = await prisma.user.findFirst({ where: { email: { contains: "nexy" } } });
  if (!user) return console.log("Nexy not found");
  const ctx = await buildIrisContext(user.id);
  console.log(ctx);
  if (ctx.includes("proposeSeveral")) console.log("FOUND proposeSeveral in ctx!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
