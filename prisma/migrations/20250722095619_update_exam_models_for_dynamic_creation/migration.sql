/*
  Warnings:

  - The `tags` column on the `ExamQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updated_at` to the `ExamQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ExamSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExamQuestion" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "question_ru" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "tags",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ExamSection" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
