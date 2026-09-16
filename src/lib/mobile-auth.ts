import { decode, encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/**
 * Mobile tokens deliberately use a fixed, public namespace as their salt and
 * the Auth.js secret as their cryptographic key. Both must stay unchanged
 * between requests and deployments for a stored session to remain valid.
 */
function mobileJwtConfig() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET (or NEXTAUTH_SECRET) must be configured in production.");
    }
    // Development-only fallback. It is never used by a production deployment.
    return { secret: "link-office-development-secret", salt: "link-office-mobile-auth" };
  }

  return {
    secret,
    salt: process.env.MOBILE_AUTH_SALT || "link-office-mobile-auth",
  };
}

export async function createMobileToken(user: {
  id: string;
  role: string;
  organizationId?: string | null;
  mustChangePassword?: boolean;
}) {
  const { secret, salt } = mobileJwtConfig();
  return encode({
    secret,
    salt,
    token: {
      sub: user.id,
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId ?? null,
      mustChangePassword: user.mustChangePassword ?? false,
      mobile: true,
    },
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getMobileUser(request: Request) {
  const header = request.headers.get("authorization") || "";

  if (!header.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = header.slice(7).trim();

  if (!token) {
    return null;
  }

  let decoded;
  try {
    const { secret, salt } = mobileJwtConfig();
    decoded = await decode({ token, secret, salt });
  } catch (error) {
    console.error("MOBILE TOKEN DECODE ERROR:", error);
    return null;
  }

  const userId = decoded?.userId || decoded?.sub;

  if (!userId || decoded?.mobile !== true) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: String(userId) },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      organizationId: true,
      mustChangePassword: true,
    },
  });
}
