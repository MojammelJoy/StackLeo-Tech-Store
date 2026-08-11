"use client";

import { cn } from "@stackleo/ui";

import { CheckIcon } from "../layout/icons";

import type { ProductVariant } from "@stackleo/types";

interface ProductVariantsProps {
  /** Already filtered to `isActive: true` by the caller — this
   * component never decides selectability itself. */
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variant: ProductVariant) => void;
  disabled?: boolean;
}

/** Shows each variant by its own `name`/`attributes` — never a raw
 * internal id — so "Red / 128GB" (or, absent attributes, the variant's
 * `name`) is what a shopper actually sees. */
function describeVariant(variant: ProductVariant): string {
  const attributeValues = Object.values(variant.attributes);
  return attributeValues.length > 0 ? attributeValues.join(" / ") : variant.name;
}

/**
 * The variant selector. Renders nothing for a product with no active
 * variants — callers should skip mounting this entirely in that case
 * rather than relying on this returning `null`, but it degrades safely
 * either way. Never pre-selects one for the caller (see
 * `ProductDetailView`'s doc comment on why): `selectedVariantId` starts
 * `null` and stays that way until a shopper clicks one.
 */
export function ProductVariants({
  variants,
  selectedVariantId,
  onSelect,
  disabled = false,
}: ProductVariantsProps) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-medium text-neutral-900">Options</p>
      <div role="radiogroup" aria-label="Product options" className="mt-2 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelect(variant)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                "disabled:pointer-events-none disabled:opacity-50",
                isSelected
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-50",
              )}
            >
              {isSelected ? <CheckIcon className="h-3.5 w-3.5" /> : null}
              {describeVariant(variant)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
