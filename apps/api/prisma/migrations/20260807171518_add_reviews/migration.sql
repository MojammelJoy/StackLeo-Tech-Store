-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "media" JSONB NOT NULL DEFAULT '[]',
    "verified_order_id" TEXT,
    "verified_order_item_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "moderation_status" TEXT NOT NULL DEFAULT 'pending',
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "unhelpful_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_helpful_votes" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_helpful_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_rating_summaries" (
    "product_id" TEXT NOT NULL,
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "rating_1_count" INTEGER NOT NULL DEFAULT 0,
    "rating_2_count" INTEGER NOT NULL DEFAULT 0,
    "rating_3_count" INTEGER NOT NULL DEFAULT 0,
    "rating_4_count" INTEGER NOT NULL DEFAULT 0,
    "rating_5_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_rating_summaries_pkey" PRIMARY KEY ("product_id")
);

-- CreateIndex
CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_user_id_idx" ON "reviews"("product_id", "user_id");

-- CreateIndex
CREATE INDEX "reviews_moderation_status_idx" ON "reviews"("moderation_status");

-- CreateIndex
CREATE INDEX "reviews_deleted_at_idx" ON "reviews"("deleted_at");

-- CreateIndex
CREATE INDEX "review_helpful_votes_review_id_idx" ON "review_helpful_votes"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_helpful_votes_review_id_user_id_key" ON "review_helpful_votes"("review_id", "user_id");

-- AddForeignKey
ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
