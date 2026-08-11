import { formatMoney } from "../../lib/format-money";

import type { ProductDetail } from "@stackleo/types";

interface ProductInfoProps {
  product: ProductDetail;
  /** The currently selected line's sku — the base product's own sku
   * when no variant is selected, otherwise the selected variant's (see
   * `resolveSelectedSku` in `lib/api/products.ts`). */
  selectedSku: string;
  /** The currently selected line's effective price/currency (see
   * `resolveSelectedPrice`) — updates live as the variant selection
   * changes. */
  price: number;
  currency: string;
}

/**
 * Name, sku, live price, description, and tags — the read-only half of
 * the PDP's right column. Never computes price/sku itself; both are
 * resolved once by the caller (`ProductDetailView`) from the current
 * selection so this component and the purchase controls can never
 * disagree about what's actually selected.
 */
export function ProductInfo({ product, selectedSku, price, currency }: ProductInfoProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{product.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">SKU: {selectedSku}</p>
      <p className="mt-4 text-2xl font-semibold text-neutral-900">{formatMoney(price, currency)}</p>

      {product.description ? (
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
          {product.description}
        </p>
      ) : null}

      {product.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
