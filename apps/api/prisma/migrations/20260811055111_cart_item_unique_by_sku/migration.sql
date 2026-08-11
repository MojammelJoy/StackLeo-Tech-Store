-- A cart line's real identity is its `sku` (base product or variant),
-- not `product_id` alone: `Product.sku`/`ProductVariant.sku` share one
-- globally-unique namespace, so two different variants of the same
-- product must be able to coexist as two separate cart_items rows.

-- DropIndex
DROP INDEX "cart_items_cart_id_product_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_sku_key" ON "cart_items"("cart_id", "sku");
