-- AlterTable
ALTER TABLE "IqrhResult" ADD COLUMN     "strengthDetails" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "watchpointDetails" JSONB NOT NULL DEFAULT '[]';
