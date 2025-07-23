/*
  Warnings:

  - The `ip_whitelist` column on the `SecuritySettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SecuritySettings" DROP COLUMN "ip_whitelist",
ADD COLUMN     "ip_whitelist" TEXT[] DEFAULT ARRAY[]::TEXT[];
