-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" TEXT NOT NULL,
    "library" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationalPrescription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "iqrhResultId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "priorityDimension" "Dimension" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelationalPrescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "libraryItemId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "rationale" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LibraryItem_library_idx" ON "LibraryItem"("library");

-- CreateIndex
CREATE INDEX "LibraryItem_library_category_idx" ON "LibraryItem"("library", "category");

-- CreateIndex
CREATE UNIQUE INDEX "RelationalPrescription_iqrhResultId_key" ON "RelationalPrescription"("iqrhResultId");

-- CreateIndex
CREATE INDEX "RelationalPrescription_userId_status_idx" ON "RelationalPrescription"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionItem_prescriptionId_libraryItemId_key" ON "PrescriptionItem"("prescriptionId", "libraryItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionItem_prescriptionId_position_key" ON "PrescriptionItem"("prescriptionId", "position");

-- AddForeignKey
ALTER TABLE "RelationalPrescription" ADD CONSTRAINT "RelationalPrescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationalPrescription" ADD CONSTRAINT "RelationalPrescription_iqrhResultId_fkey" FOREIGN KEY ("iqrhResultId") REFERENCES "IqrhResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "RelationalPrescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_libraryItemId_fkey" FOREIGN KEY ("libraryItemId") REFERENCES "LibraryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
