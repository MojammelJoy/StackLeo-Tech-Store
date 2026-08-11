import type { ProductSpecification } from "@stackleo/types";

interface ProductSpecificationsProps {
  specifications: ProductSpecification[];
}

/** Renders nothing for a product with no specifications — "specifications
 * if available" per the PDP spec, not an empty section header. */
export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  if (specifications.length === 0) {
    return null;
  }

  const ordered = [...specifications].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="border-t border-neutral-200 pt-6">
      <h2 className="text-base font-semibold text-neutral-900">Specifications</h2>
      <dl className="mt-3 divide-y divide-neutral-100 text-sm">
        {ordered.map((spec) => (
          <div key={spec.id} className="flex justify-between gap-4 py-2">
            <dt className="text-neutral-500">{spec.key}</dt>
            <dd className="text-right font-medium text-neutral-900">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
