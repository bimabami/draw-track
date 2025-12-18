-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('SHOP_DRAWING', 'FOR_CONSTRUCTION');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "type" "DocumentType" NOT NULL DEFAULT 'SHOP_DRAWING';
