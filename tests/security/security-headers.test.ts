import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";

describe("C3 — En-têtes de Sécurité HTTP et CSP (E02)", () => {
  it("Vérifie la présence et la conformité des en-têtes de sécurité dans next.config.ts", async () => {
    expect(nextConfig.headers).toBeDefined();
    const headersRules = await nextConfig.headers!();
    expect(headersRules).toBeInstanceOf(Array);

    const globalRule = headersRules.find(
      (rule) => rule.source === "/(.*)" || rule.source === "/:path*"
    );
    expect(globalRule).toBeDefined();

    const headersMap = new Map<string, string>();
    for (const header of globalRule!.headers) {
      headersMap.set(header.key.toLowerCase(), header.value);
    }

    // 1. Content-Security-Policy-Report-Only (Présent et restrictif)
    const cspReportOnly = headersMap.get("content-security-policy-report-only");
    expect(cspReportOnly).toBeDefined();
    expect(cspReportOnly).toContain("default-src 'self'");
    expect(cspReportOnly).toContain("frame-ancestors 'none'");
    expect(cspReportOnly).toContain("object-src 'none'");

    // 2. X-Frame-Options : DENY (anti-clickjacking strict)
    expect(headersMap.get("x-frame-options")).toBe("DENY");

    // 3. X-Content-Type-Options : nosniff (anti-MIME sniffing)
    expect(headersMap.get("x-content-type-options")).toBe("nosniff");

    // 4. Referrer-Policy : strict-origin-when-cross-origin
    expect(headersMap.get("referrer-policy")).toBe("strict-origin-when-cross-origin");

    // 5. Permissions-Policy minimale
    const permissionsPolicy = headersMap.get("permissions-policy");
    expect(permissionsPolicy).toBeDefined();
    expect(permissionsPolicy).toContain("camera=()");
    expect(permissionsPolicy).toContain("microphone=()");
    expect(permissionsPolicy).toContain("geolocation=()");
  });

  it("Vérifie l'application des en-têtes aux routes pages (/) et API (/api/(.*))", async () => {
    const headersRules = await nextConfig.headers!();
    const globalRule = headersRules.find(
      (rule) => rule.source === "/(.*)" || rule.source === "/:path*"
    );

    // Le wildcard /(.*) garantit que les routes d'API et les pages HTML reçoivent toutes les en-têtes
    const regex = new RegExp(`^${globalRule!.source.replace("(.*)", ".*")}$`);
    expect(regex.test("/")).toBe(true);
    expect(regex.test("/api/auth/csrf")).toBe(true);
    expect(regex.test("/api/iris/conversation/123/message")).toBe(true);
  });
});
