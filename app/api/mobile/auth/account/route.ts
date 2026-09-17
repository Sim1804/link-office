import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
      const assessments = await tx.assessment.findMany({ where: { userId: user.id }, select: { id: true } });
      const assessmentIds = assessments.map((assessment) => assessment.id);

      // Delete explicitly as well as relying on the schema cascades. This
      // makes account removal work against databases created by older schema
      // revisions where every FK cascade may not yet have been applied.
      await tx.prescriptionItem.deleteMany({ where: { prescription: { userId: user.id } } });
      await tx.relationalPrescription.deleteMany({ where: { userId: user.id } });
      if (assessmentIds.length > 0) {
        await tx.campaignVariableAnswer.deleteMany({ where: { assessmentId: { in: assessmentIds } } });
        await tx.adaptiveAnswer.deleteMany({ where: { assessmentId: { in: assessmentIds } } });
        await tx.questionnaireAnswer.deleteMany({ where: { assessmentId: { in: assessmentIds } } });
        await tx.demographicProfile.deleteMany({ where: { assessmentId: { in: assessmentIds } } });
        await tx.icrResult.deleteMany({ where: { iqrhResult: { assessmentId: { in: assessmentIds } } } });
        await tx.profileResult.deleteMany({ where: { iqrhResult: { assessmentId: { in: assessmentIds } } } });
        await tx.iqrhResult.deleteMany({ where: { assessmentId: { in: assessmentIds } } });
        await tx.assessment.deleteMany({ where: { id: { in: assessmentIds } } });
      }
      await tx.relationalPair.deleteMany({ where: { OR: [{ initiatorId: user.id }, { receiverId: user.id }] } });
      await tx.userBadge.deleteMany({ where: { userId: user.id } });
      await tx.userStats.deleteMany({ where: { userId: user.id } });
      await tx.notification.deleteMany({ where: { userId: user.id } });
      await tx.userSubscription.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
    }, { maxWait: 10_000, timeout: 30_000 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MOBILE ACCOUNT DELETE ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Prisma.PrismaClientInitializationError ? "Le service de données est momentanément indisponible. Réessayez plus tard." : "La suppression du compte a échoué. Réessayez plus tard." },
      { status: error instanceof Prisma.PrismaClientInitializationError ? 503 : 500 }
    );
  }
}
