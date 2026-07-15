-- AlterTable
ALTER TABLE "IqrhResult" ADD COLUMN     "balanceInterpretation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "balanceLevel" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "weatherIcon" TEXT NOT NULL DEFAULT '';
