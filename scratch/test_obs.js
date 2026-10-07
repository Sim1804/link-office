async function test() {
  try {
    const { GET } = require('../app/api/observatoire/route.ts');
  } catch (e) {
    // If typescript needs ts-node, let's test via direct prisma query
  }
}
