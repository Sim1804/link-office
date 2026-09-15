import { decode, encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const secret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "my-super-secret-auth-key-1234";

const salt =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "link-office-mobile-auth";

export async function createMobileToken(user: {
  id: string;
  role: string;
  organizationId?: string | null;
  mustChangePassword?: boolean;
}) {
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

  const decoded = await decode({
    token,
    secret,
    salt,
  });

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