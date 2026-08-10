"use client";

import { Container, Skeleton } from "@stackleo/ui";

import { useCart, useClearCart } from "../../hooks/use-cart";
import { useProductsBulk } from "../../hooks/use-products";

import { CartError } from "./CartError";
import { CartItemRow } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";

import type { BulkProductLookupItem } from "@stackleo/types";

function CartLoadingSkeleton() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <li key={index} className="flex gap-4 rounded-lg border border-neutral-200 bg-white p-4">
            <Skeleton className="h-20 w-20 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </li>
        ))}
      </ul>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/**
 * Orchestrates the cart page: `useCart()` is the single source of truth
 * for items/quantity/selection/totals; `useProductsBulk` is a purely
 * additive, non-fatal enrichment for name/image — one batched request
 * for every distinct `productId` on the cart, never one per line (see
 * `hooks/use-products.ts`). A product-lookup failure never blocks
 * quantity/selection/remove/clear, which only ever depend on `useCart`.
 */
export function CartView() {
  const { data: cart, isPending, isError, isFetching, refetch } = useCart();
  const clearCart = useClearCart();

  const productIds = cart ? [...new Set(cart.items.map((item) => item.productId))] : [];
  const products = useProductsBulk(productIds);

  const productsById = new Map<string, BulkProductLookupItem>(
    (products.data ?? []).map((product) => [product.id, product]),
  );

  function handleClearCart() {
    if (window.confirm("Remove all items from your cart?")) {
      clearCart.mutate();
    }
  }

  return (
    <Container className="py-10 sm:py-16">
      <h1 className="text-2xl font-bold text-neutral-900">Your Cart</h1>

      {isPending ? (
        <CartLoadingSkeleton />
      ) : isError ? (
        <CartError onRetry={() => refetch()} isRetrying={isFetching} />
      ) : cart.items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in your cart
              </p>
              <button
                type="button"
                onClick={handleClearCart}
                disabled={clearCart.isPending}
                className="text-sm font-medium text-neutral-500 hover:text-red-600 disabled:opacity-50"
              >
                {clearCart.isPending ? "Clearing…" : "Clear cart"}
              </button>
            </div>

            <ul className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  product={productsById.get(item.productId)}
                  isProductInfoLoading={products.isPending}
                  currency={cart.summary.currency}
                />
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary summary={cart.summary} />
          </div>
        </div>
      )}
    </Container>
  );
}
