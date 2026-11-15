-- AlterTable
ALTER TABLE "social_mentions" ADD COLUMN "author" TEXT;
ALTER TABLE "social_mentions" ADD COLUMN "posted_at" TIMESTAMPTZ(6);
ALTER TABLE "social_mentions" ADD COLUMN "confidence" TEXT;

-- CreateIndex
CREATE INDEX "social_mentions_meshi_id_confidence_posted_at_idx" ON "social_mentions"("meshi_id", "confidence", "posted_at");
