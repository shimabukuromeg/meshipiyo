-- AlterTable
ALTER TABLE "meshis" ADD COLUMN "places_image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "meshis" ADD COLUMN "google_place_id" TEXT;

-- CreateTable
CREATE TABLE "places_api_usage" (
    "month" TEXT NOT NULL,
    "search_count" INTEGER NOT NULL DEFAULT 0,
    "details_count" INTEGER NOT NULL DEFAULT 0,
    "photo_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "places_api_usage_pkey" PRIMARY KEY ("month")
);
