-- CreateTable
CREATE TABLE "IrisConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IrisConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IrisMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IrisMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "IrisConversation_userId_createdAt_idx" ON "IrisConversation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "IrisMessage_conversationId_createdAt_idx" ON "IrisMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "IrisConversation" ADD CONSTRAINT "IrisConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrisMessage" ADD CONSTRAINT "IrisMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "IrisConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;