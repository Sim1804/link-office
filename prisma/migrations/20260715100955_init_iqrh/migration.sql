-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "QuestionKind" AS ENUM ('REFERENCE', 'ADAPTIVE');

-- CreateEnum
CREATE TYPE "Dimension" AS ENUM ('SOCIAL', 'AFFECTIVE', 'SENTIMENTAL', 'PROFESSIONAL', 'SELF');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "consentInformation" BOOLEAN NOT NULL DEFAULT false,
    "consentResearch" BOOLEAN NOT NULL DEFAULT false,
    "consentParticipation" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemographicProfile" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "department" TEXT,
    "occupation" TEXT NOT NULL,
    "organizationSize" TEXT,
    "relationshipStatus" TEXT NOT NULL,
    "children" BOOLEAN NOT NULL,
    "childrenCount" INTEGER,
    "livingSituation" TEXT NOT NULL,
    "livingSituationOther" TEXT,
    "selectedSituations" TEXT[],
    "primarySituation" TEXT,

    CONSTRAINT "DemographicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdaptiveModule" (
    "id" TEXT NOT NULL,
    "triggerSituation" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "AdaptiveModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "kind" "QuestionKind" NOT NULL DEFAULT 'REFERENCE',
    "dimension" "Dimension" NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdaptiveQuestion" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdaptiveQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireAnswer" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "QuestionnaireAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdaptiveAnswer" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "adaptiveQuestionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "AdaptiveAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IqrhResult" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "globalScore" DOUBLE PRECISION NOT NULL,
    "socialScore" DOUBLE PRECISION NOT NULL,
    "affectiveScore" DOUBLE PRECISION NOT NULL,
    "sentimentalScore" DOUBLE PRECISION NOT NULL,
    "professionalScore" DOUBLE PRECISION NOT NULL,
    "selfScore" DOUBLE PRECISION NOT NULL,
    "weather" TEXT NOT NULL,
    "balanceIndex" DOUBLE PRECISION NOT NULL,
    "priorityDimension" "Dimension" NOT NULL,
    "strengths" TEXT[],
    "watchpoints" TEXT[],
    "primaryProfile" TEXT NOT NULL,
    "secondaryProfile" TEXT NOT NULL,
    "profileSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IqrhResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Assessment_userId_status_idx" ON "Assessment"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DemographicProfile_assessmentId_key" ON "DemographicProfile"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AdaptiveModule_triggerSituation_key" ON "AdaptiveModule"("triggerSituation");

-- CreateIndex
CREATE UNIQUE INDEX "Question_position_key" ON "Question"("position");

-- CreateIndex
CREATE UNIQUE INDEX "AdaptiveQuestion_moduleId_position_key" ON "AdaptiveQuestion"("moduleId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireAnswer_assessmentId_questionId_key" ON "QuestionnaireAnswer"("assessmentId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdaptiveAnswer_assessmentId_adaptiveQuestionId_key" ON "AdaptiveAnswer"("assessmentId", "adaptiveQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "IqrhResult_assessmentId_key" ON "IqrhResult"("assessmentId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemographicProfile" ADD CONSTRAINT "DemographicProfile_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveQuestion" ADD CONSTRAINT "AdaptiveQuestion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AdaptiveModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveAnswer" ADD CONSTRAINT "AdaptiveAnswer_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptiveAnswer" ADD CONSTRAINT "AdaptiveAnswer_adaptiveQuestionId_fkey" FOREIGN KEY ("adaptiveQuestionId") REFERENCES "AdaptiveQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IqrhResult" ADD CONSTRAINT "IqrhResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
