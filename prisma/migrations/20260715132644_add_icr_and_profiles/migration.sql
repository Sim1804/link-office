-- CreateEnum
CREATE TYPE "AdaptivePolarity" AS ENUM ('POSITIVE', 'NEGATIVE');

-- AlterTable
ALTER TABLE "AdaptiveQuestion" ADD COLUMN     "polarity" "AdaptivePolarity" NOT NULL DEFAULT 'POSITIVE';

-- AlterTable
ALTER TABLE "IqrhResult" ADD COLUMN     "bestDimension" "Dimension" NOT NULL DEFAULT 'SOCIAL',
ADD COLUMN     "secondBestDimension" "Dimension" NOT NULL DEFAULT 'SOCIAL',
ADD COLUMN     "thirdBestDimension" "Dimension" NOT NULL DEFAULT 'SOCIAL',
ADD COLUMN     "weakDimension" "Dimension" NOT NULL DEFAULT 'SOCIAL',
ADD COLUMN     "weatherText" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "weatherTitle" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "IcrResult" (
    "id" TEXT NOT NULL,
    "iqrhResultId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "familyComplexity" INTEGER NOT NULL,
    "professionalComplexity" INTEGER NOT NULL,
    "lifeTransitions" INTEGER NOT NULL,
    "relationalLoad" INTEGER NOT NULL,
    "protectiveResources" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "interpretation" TEXT NOT NULL,
    "riskFactors" TEXT[],
    "protectiveFactors" TEXT[],
    "resources" TEXT[],
    "vulnerabilities" TEXT[],
    "barriers" TEXT[],
    "levers" TEXT[],
    "dominantNeeds" TEXT[],

    CONSTRAINT "IcrResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileResult" (
    "id" TEXT NOT NULL,
    "iqrhResultId" TEXT NOT NULL,
    "primaryName" TEXT NOT NULL,
    "secondaryName" TEXT NOT NULL,
    "primaryScore" INTEGER NOT NULL,
    "secondaryScore" INTEGER NOT NULL,
    "primaryConfidence" INTEGER NOT NULL,
    "secondaryConfidence" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "irisContext" JSONB NOT NULL,

    CONSTRAINT "ProfileResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IcrResult_iqrhResultId_key" ON "IcrResult"("iqrhResultId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileResult_iqrhResultId_key" ON "ProfileResult"("iqrhResultId");

-- AddForeignKey
ALTER TABLE "IcrResult" ADD CONSTRAINT "IcrResult_iqrhResultId_fkey" FOREIGN KEY ("iqrhResultId") REFERENCES "IqrhResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileResult" ADD CONSTRAINT "ProfileResult_iqrhResultId_fkey" FOREIGN KEY ("iqrhResultId") REFERENCES "IqrhResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
