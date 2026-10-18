import fs from "fs";

const results = JSON.parse(
  fs.readFileSync("validation/t4-authz/raw/matrix-exec-results.json", "utf8")
);

const conflicts = results.filter(
  (r: any) =>
    (r.expected === "403" || r.expected === "403_OR_404") &&
    r.actualStatus === 200
);

console.log("Total cellules 403-attendu renvoyant 200 :", conflicts.length);

const byEp: Record<string, any[]> = {};
for (const c of conflicts) {
  byEp[c.endpoint] = byEp[c.endpoint] || [];
  byEp[c.endpoint].push({
    method: c.method,
    identity: c.identity,
    actualStatus: c.actualStatus,
    expected: c.expected,
    url: c.url,
  });
}

console.log(JSON.stringify(byEp, null, 2));
