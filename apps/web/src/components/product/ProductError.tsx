interface ProductErrorProps {
  onRetry: () => void;
  isRetrying: boolean;
}

/** Generic (non-404) product-fetch failure. Same pattern as `cart`'s
 * `CartError.tsx` — never shows the raw error/payload, just a
 * user-friendly message and a retry action. */
export function ProductError({ onRetry, isRetrying }: ProductErrorProps) {
  return (
    <div
      role="alert"
      className="mt-8 flex flex-col items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-6"
    >
      <p className="text-sm text-neutral-600">
        We couldn&apos;t load this product right now. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50"
      >
        {isRetrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}
