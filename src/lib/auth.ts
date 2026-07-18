/**
 * auth.ts — Configuration NextAuth.js
 * ─────────────────────────────────────
 * Credentials Provider : valide email/password via l'API interne Next.js.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Appel interne vers l'API du projet via le proxy Next.js
          const url = new URL(
            "/api/v1/users/login",
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          ).toString();

          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const user = await res.json();
          return {
            id: user.user_id,
            email: user.email,
            name: `${user.prenom} ${user.nom}`,
            // Le token JWT renvoyé par le backend
            accessToken: user.access_token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persister le token d'accès et l'ID utilisateur dans le JWT de session
      if (user) {
        token.accessToken = (user as Record<string, unknown>).accessToken as string;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Rendre le token et l'ID accessibles côté client via useSession()
      session.user.id = token.userId as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as unknown as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt" },
});
