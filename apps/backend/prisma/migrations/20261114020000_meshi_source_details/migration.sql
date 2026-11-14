-- AlterTable
ALTER TABLE "meshis" ADD COLUMN "phone" TEXT,
ADD COLUMN "business_hours" TEXT,
ADD COLUMN "holiday" TEXT,
ADD COLUMN "parking" TEXT,
ADD COLUMN "payment_methods" TEXT,
ADD COLUMN "official_url" TEXT,
ADD COLUMN "sns_url" TEXT,
ADD COLUMN "theme" TEXT,
ADD COLUMN "source_verified_at" TIMESTAMPTZ(6);
