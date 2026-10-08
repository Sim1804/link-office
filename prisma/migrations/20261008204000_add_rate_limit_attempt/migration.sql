-- CreateTable
CREATE TABLE "RateLimitAttempt" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimitAttempt_key_timestamp_idx" ON "RateLimitAttempt"("key", "timestamp");
