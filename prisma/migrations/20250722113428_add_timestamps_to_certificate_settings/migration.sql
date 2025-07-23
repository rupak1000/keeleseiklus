/*
  Warnings:

  - Added the required column `updated_at` to the `CertificateSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CertificateSettings" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
