"use client";

import { Button } from "@stackleo/ui";
import { useState } from "react";

import { useAddToCart } from "../../hooks/use-cart";
import { ApiError } from "../../lib/api/client";
import { QuantityStepper } from "../cart/QuantityStepper";
import { CheckIcon } from "../layout/icons";

const MIN_QUANTITY = 1;

interface ProductPurchaseProps {
  productId: string;
  /** The resolved sku to send to `POST /cart/items` — the base
   * product's own sku, or the selected active variant's (see
   * `resolveSelectedSku`). */
  selectedSku: string;
  /** `false` when active variants exist and none is selected yet — the
   * button stays disabled and `selectionHint` explains why, rather than
   * silently adding an arbitrary variant or falling back to the base sku. */
  canAddToCart: boolean;
  selectionHint?: string;
}

/**
 * Quantity stepper + Add to Cart button + every post-click state this
 * task requires: pending (controls disabled), success (inline
 * confirmation), 409 stock conflict (the backend's own message, not a
 * client-invented "out of stock" claim — there is no public stock
 * endpoint to check ahead of time, see `lib/api/products.ts`), and any
 * other error (generic, no raw payload). Reuses `cart`'s
 * `QuantityStepper` verbatim (same min/max/disabled contract this task
 * asks for) rather than duplicating it as a separate `ProductQuantity`.
 * After a successful add, relies entirely on `useAddToCart`'s own cache
 * update (`hooks/use-cart.ts`) — never computes or stores a cart total
 * itself.
 */
export function ProductPurchase({
  productId,
  selectedSku,
  canAddToCart,
  selectionHint,
}: ProductPurchaseProps) {
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const addToCart = useAddToCart();

  function handleAddToCart() {
    addToCart.mutate({ productId, sku: selectedSku, quantity });
  }

  const isStockConflict =
    addToCart.isError && addToCart.error instanceof ApiError && addToCart.error.status === 409;
  const errorMessage = addToCart.isError
    ? addToCart.error instanceof ApiError
      ? addToCart.error.message
      : "Something went wrong. Please try again."
    : null;

  return (
    <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
      <div>
        <p className="text-sm font-medium text-neutral-900">Quantity</p>
        <div className="mt-2">
          <QuantityStepper
            quantity={quantity}
            disabled={addToCart.isPending}
            onDecrease={() => setQuantity((current) => current - 1)}
            onIncrease={() => setQuantity((current) => current + 1)}
          />
        </div>
      </div>

      <Button
        size="lg"
        onClick={handleAddToCart}
        disabled={!canAddToCart || addToCart.isPending}
        className="w-full sm:w-auto"
      >
        {addToCart.isPending ? "Adding…" : "Add to Cart"}
      </Button>

      {!canAddToCart && selectionHint ? (
        <p className="text-sm text-amber-600">{selectionHint}</p>
      ) : null}

      {addToCart.isSuccess ? (
        <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-green-700">
          <CheckIcon className="h-4 w-4" />
          Added to cart
        </p>
      ) : null}

      {errorMessage ? (
        <p
          role="alert"
          className={`text-sm ${isStockConflict ? "text-amber-700" : "text-red-600"}`}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
