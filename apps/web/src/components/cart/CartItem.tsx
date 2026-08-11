"use client";

import { Skeleton } from "@stackleo/ui";
import Link from "next/link";

import { useRemoveCartItem, useUpdateCartItem } from "../../hooks/use-cart";
import { formatMoney } from "../../lib/format-money";
import { CartIcon, TrashIcon } from "../layout/icons";

import { QuantityStepper } from "./QuantityStepper";

import type { BulkProductLookupItem, CartItem as CartItemType } from "@stackleo/types";

interface CartItemRowProps {
  item: CartItemType;
  /** `undefined` while loading, absent from the bulk response (hidden/
   * deleted since being added), or absent because the lookup itself
   * failed — all three fall back to the same SKU-only display. */
  product: BulkProductLookupItem | undefined;
  isProductInfoLoading: boolean;
  currency: string;
}

/**
 * One cart line. Never shows a locally-guessed quantity/total —
 * `item.quantity`/`item.lineTotal` always come from the server-returned
 * cart already sitting in the query cache (see `hooks/use-cart.ts`);
 * this component only disables its controls while its own mutation is
 * in flight and waits for the next cache update to reflect the result.
 */
export function CartItemRow({ item, product, isProductInfoLoading, currency }: CartItemRowProps) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const isMutating = updateItem.isPending || removeItem.isPending;
  const displayName = product?.name ?? `Product (SKU: ${item.sku})`;

  return (
    <li
      className={`flex gap-4 rounded-lg border border-neutral-200 bg-white p-4 ${
        item.selected ? "" : "opacity-60"
      }`}
    >
      <input
        type="checkbox"
        checked={item.selected}
        onChange={(event) =>
          updateItem.mutate({ itemId: item.id, input: { selected: event.target.checked } })
        }
        disabled={isMutating}
        aria-label={`Include ${displayName} in order total`}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300"
      />

      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {isProductInfoLoading ? (
          <Skeleton className="h-full w-full" />
        ) : product?.image ? (
          // Plain <img> deliberately: next/image needs remotePatterns
          // pointing at the API's media host, out of scope for this change.
          <img
            src={product.image.url}
            alt={product.image.altText ?? product.name}
            loading="lazy"
            sizes="80px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <CartIcon className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {isProductInfoLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : product?.slug ? (
            <Link
              href={`/products/${product.slug}`}
              className="truncate font-medium text-neutral-900 hover:underline"
            >
              {displayName}
            </Link>
          ) : (
            <p className="truncate font-medium text-neutral-900">{displayName}</p>
          )}
          <p className="mt-1 text-xs text-neutral-500">SKU: {item.sku}</p>

          <div className="mt-3">
            <QuantityStepper
              quantity={item.quantity}
              disabled={isMutating}
              onDecrease={() =>
                updateItem.mutate({ itemId: item.id, input: { quantity: item.quantity - 1 } })
              }
              onIncrease={() =>
                updateItem.mutate({ itemId: item.id, input: { quantity: item.quantity + 1 } })
              }
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
          <p className="font-semibold text-neutral-900">{formatMoney(item.lineTotal, currency)}</p>
          <button
            type="button"
            onClick={() => removeItem.mutate(item.id)}
            disabled={isMutating}
            aria-label={`Remove ${displayName} from cart`}
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            {removeItem.isPending ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </li>
  );
}
