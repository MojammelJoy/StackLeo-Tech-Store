-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "max_discount_amount" INTEGER,
    "min_order_amount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "usage_limit_per_user" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "eligible_user_ids" JSONB,
    "eligible_product_ids" JSONB,
    "eligible_category_ids" JSONB,
    "eligible_brand_ids" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_redemptions" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "discount_amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "removed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_status_idx" ON "coupons"("status");

-- CreateIndex
CREATE INDEX "coupons_deleted_at_idx" ON "coupons"("deleted_at");

-- CreateIndex
CREATE INDEX "coupon_redemptions_coupon_id_idx" ON "coupon_redemptions"("coupon_id");

-- CreateIndex
CREATE INDEX "coupon_redemptions_user_id_idx" ON "coupon_redemptions"("user_id");

-- CreateIndex
CREATE INDEX "coupon_redemptions_cart_id_idx" ON "coupon_redemptions"("cart_id");

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
