import { formatMoney } from "../../lib/format-money";

import type { CartSummary as CartSummaryType } from "@stackleo/types";

interface CartSummaryProps {
  summary: CartSummaryType;
}

/**
 * Renders `cart.summary` verbatim — every value comes straight from the
 * server response, never recomputed here. `discountTotal` only renders
 * when non-zero (no discount module exists on the backend yet, so it's
 * always `0` today; the field is still rendered honestly if that ever
 * changes).
 */
export function CartSummary({ summary }: CartSummaryProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
      <h2 className="text-base font-semibold text-neutral-900">Order Summary</h2>
      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-neutral-500">Items</dt>
          <dd className="text-neutral-900">{summary.itemCount}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-neutral-500">Subtotal</dt>
          <dd className="text-neutral-900">{formatMoney(summary.subtotal, summary.currency)}</dd>
        </div>
        {summary.discountTotal > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-neutral-500">Discount</dt>
            <dd className="text-neutral-900">
              -{formatMoney(summary.discountTotal, summary.currency)}
            </dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <dt className="text-neutral-500">Tax</dt>
          <dd className="text-neutral-900">{formatMoney(summary.taxTotal, summary.currency)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-neutral-500">Shipping</dt>
          <dd className="text-neutral-900">
            {formatMoney(summary.shippingTotal, summary.currency)}
          </dd>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-3 text-base">
          <dt className="font-semibold text-neutral-900">Total</dt>
          <dd className="font-semibold text-neutral-900">
            {formatMoney(summary.total, summary.currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
