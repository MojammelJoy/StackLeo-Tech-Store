"use client";

import { MinusIcon, PlusIcon } from "../layout/icons";

/** Mirrors apps/api's `CART_ITEM_MIN_QUANTITY`/`CART_ITEM_MAX_QUANTITY`
 * (apps/api/src/modules/cart/constants/cart.constants.ts). */
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

interface QuantityStepperProps {
  quantity: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}

/**
 * Purely presentational — never shows a locally-guessed quantity. The
 * displayed `quantity` always comes from the server-returned cart (see
 * `CartItem.tsx`); this component only disables itself while a mutation
 * is pending and lets the new value arrive via the query cache once the
 * server confirms it.
 */
export function QuantityStepper({
  quantity,
  disabled = false,
  onDecrease,
  onIncrease,
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-neutral-300">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= MIN_QUANTITY}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium text-neutral-900" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || quantity >= MAX_QUANTITY}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
