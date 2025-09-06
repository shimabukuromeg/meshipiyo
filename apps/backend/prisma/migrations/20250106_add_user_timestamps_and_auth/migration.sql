-- AlterTable
ALTER TABLE "users" 
ADD COLUMN "auth_provider" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "firebase_uid" TEXT,
ADD COLUMN "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");