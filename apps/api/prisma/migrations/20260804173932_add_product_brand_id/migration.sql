-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brand_id" TEXT;

-- CreateIndex
CREATE INDEX "products_brand_id_idx" ON "products"("brand_id");
