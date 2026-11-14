-- CreateTable
CREATE TABLE "social_mentions" (
    "id" SERIAL NOT NULL,
    "meshi_id" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_mentions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_mentions_meshi_id_idx" ON "social_mentions"("meshi_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_mentions_meshi_id_url_key" ON "social_mentions"("meshi_id", "url");

-- AddForeignKey
ALTER TABLE "social_mentions" ADD CONSTRAINT "social_mentions_meshi_id_fkey" FOREIGN KEY ("meshi_id") REFERENCES "meshis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
