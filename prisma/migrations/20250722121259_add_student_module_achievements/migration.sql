/*
  Warnings:

  - Added the required column `updated_at` to the `StudentModule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "total_study_time_minutes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "StudentModule" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "cultural" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "grammar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listening" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pronunciation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quiz" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reading" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "speaking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "story" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "time_spent" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vocabulary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "writing" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge_image" TEXT,
    "criteria" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "achievement_id" INTEGER NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAchievement_student_id_idx" ON "UserAchievement"("student_id");

-- CreateIndex
CREATE INDEX "UserAchievement_achievement_id_idx" ON "UserAchievement"("achievement_id");

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
