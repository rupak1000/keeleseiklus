-- AlterTable
ALTER TABLE "StudentModule" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'not_started';

-- CreateIndex
CREATE INDEX "StudentModule_status_idx" ON "StudentModule"("status");
