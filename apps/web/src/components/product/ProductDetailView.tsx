"use client";

import { Container } from "@stackleo/ui";
import { useEffect, useState } from "react";

import { useProductMedia } from "../../hooks/use-product-media";
import { useProductBySlug } from "../../hooks/use-products";
import { ApiError } from "../../lib/api/client";
import { resolveSelectedPrice, resolveSelectedSku } from "../../lib/api/products";

import { ProductError } from "./ProductError";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductLoadingSkeleton } from "./ProductLoadingSkeleton";
import { ProductNotFound } from "./ProductNotFound";
import { ProductPurchase } from "./ProductPurchase";
import { ProductSpecifications } from "./ProductSpecifications";
import { ProductVariants } from "./ProductVariants";

import type { ProductVariant } from "@stackleo/types";

interface ProductDetailViewProps {
  slug: string;
}

/**
 * The Product Details Page body. Owns the one piece of client state
 * this page needs — which active variant (if any) is currently
 * selected — and derives the effective sku/price from it in one place
 * (`resolveSelectedSku`/`resolveSelectedPrice`), so `ProductInfo` (the
 * display) and `ProductPurchase` (the add-to-cart action) can never
 * disagree about the current selection. Deliberately plain `useState`,
 * not a new state-management system: this state is local to one page
 * and dies with it — `useAddToCart`'s own TanStack Query cache remains
 * the only source of truth for the cart itself.
 *
 * Media (`useProductMedia`) is fetched as a separate, independently-
 * loading/erroring query from the product itself — a gallery failure
 * must never block the name/price/variants/purchase controls from
 * rendering (see `ProductGallery`'s `isError` handling).
 */
export function ProductDetailView({ slug }: ProductDetailViewProps) {
  const productQuery = useProductBySlug(slug);
  const mediaQuery = useProductMedia(productQuery.data?.id);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // A different product (new slug) means any previously selected
  // variant no longer applies — never carry a stale selection across
  // products. Never auto-selects one either (see `ProductVariants`'s
  // doc comment): this only ever resets to "nothing selected".
  useEffect(() => {
    setSelectedVariantId(null);
  }, [productQuery.data?.id]);

  if (productQuery.isPending) {
    return (
      <Container className="py-10 sm:py-16">
        <ProductLoadingSkeleton />
      </Container>
    );
  }

  if (productQuery.isError) {
    if (productQuery.error instanceof ApiError && productQuery.error.status === 404) {
      return (
        <Container className="py-10 sm:py-16">
          <ProductNotFound />
        </Container>
      );
    }
    return (
      <Container className="py-10 sm:py-16">
        <ProductError onRetry={() => productQuery.refetch()} isRetrying={productQuery.isFetching} />
      </Container>
    );
  }

  const product = productQuery.data;
  const activeVariants = product.variants.filter((variant) => variant.isActive);
  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ?? null;
  const requiresVariantSelection = activeVariants.length > 0;
  const canAddToCart = !requiresVariantSelection || selectedVariant !== null;

  const selectedSku = resolveSelectedSku(product, selectedVariant);
  const { price, currency } = resolveSelectedPrice(product, selectedVariant);

  function handleSelectVariant(variant: ProductVariant) {
    setSelectedVariantId(variant.id);
  }

  return (
    <Container className="py-10 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          productName={product.name}
          assets={mediaQuery.data}
          isLoading={mediaQuery.isPending}
          isError={mediaQuery.isError}
        />

        <div className="flex flex-col gap-6">
          <ProductInfo
            product={product}
            selectedSku={selectedSku}
            price={price}
            currency={currency}
          />

          {requiresVariantSelection ? (
            <ProductVariants
              variants={activeVariants}
              selectedVariantId={selectedVariantId}
              onSelect={handleSelectVariant}
            />
          ) : null}

          <ProductPurchase
            key={selectedSku}
            productId={product.id}
            selectedSku={selectedSku}
            canAddToCart={canAddToCart}
            selectionHint={
              !canAddToCart ? "Please select an option before adding to cart." : undefined
            }
          />

          <ProductSpecifications specifications={product.specifications} />
        </div>
      </div>
    </Container>
  );
}
