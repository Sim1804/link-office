import { NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * Permanently removes the authenticated mobile account. The user id is read
 * exclusively from the verified bearer token; no client-provided id is used.
 */
export async function DELETE(request: Request) {
  const user = await getMobileUser(request);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // EventLog intentionally has no Prisma relation to User, so it does not
      // participate in the schema-level cascade and must be removed manually.
      await tx.eventLog.deleteMany({ where: { userId: user.id } });
      // Schema cascades remove assessments (and their answers, demographics and
      // results), pairs, prescriptions, badges, stats, notifications and the
      // optional user subscription atomically with the user.
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MOBILE ACCOUNT DELETE ERROR:", error);
    return NextResponse.json(
      { error: "La suppression du compte a échoué. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
