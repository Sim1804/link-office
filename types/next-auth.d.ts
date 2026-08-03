/**
 * types/next-auth.d.ts — Extension du type Session NextAuth
 * ─────────────────────────────────────────────────────────
 * Ajoute `role` et `organizationId` aux types Session et JWT
 * pour un typage strict partout dans l'application.
 */
import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      organizationId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    organizationId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId: string;
    role: string;
    organizationId: string | null;
  }
}
