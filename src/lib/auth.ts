/**
 * src/lib/auth.ts — Configuration NextAuth.js
 * ─────────────────────────────────────────────────────────
 * Credentials Provider : valide email/password via Prisma.
 * Propage `role` et `organizationId` dans le JWT et la Session.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "my-super-secret-auth-key-1234",
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // ── Rate limiting : 5 tentatives max par email par minute ──
        const key = `login:${String(credentials.email).toLowerCase()}`;
        if (!rateLimit(key, { limit: 5, windowMs: 60_000 })) {
          const retry = getRetryAfterSeconds(key);
          throw new Error(`RATE_LIMITED:${retry}`);
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              password: true,
              role: true,
              organizationId: true,
              mustChangePassword: true,
            },
          });

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            organizationId: user.organizationId,
            mustChangePassword: user.mustChangePassword,
          };
        } catch (error) {
          console.error("AUTH ERROR:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role: string }).role;
        token.organizationId = (user as { organizationId: string | null }).organizationId ?? null;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as string;
      session.user.organizationId = (token.organizationId as string | null) ?? null;
      (session.user as any).mustChangePassword = token.mustChangePassword as boolean;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt" },
});
