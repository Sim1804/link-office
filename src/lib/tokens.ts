import { prisma } from "./prisma";
import crypto from "crypto";

/**
 * Génère un jeton de vérification pour une adresse email.
 * Si un jeton existe déjà, il est supprimé avant d'en créer un nouveau.
 * Le jeton expire au bout d'une heure.
 */
export async function generateVerificationToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 heure

  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token,
        },
      },
    });
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}
