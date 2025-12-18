-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STAFF', 'MANAGER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STAFF';
