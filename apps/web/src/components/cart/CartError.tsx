interface CartErrorProps {
  onRetry: () => void;
  isRetrying: boolean;
}

/** Same error-state pattern as `CategoryGrid.tsx`. */
export function CartError({ onRetry, isRetrying }: CartErrorProps) {
  return (
    <div
      role="alert"
      className="mt-8 flex flex-col items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-6"
    >
      <p className="text-sm text-neutral-600">
        We couldn&apos;t load your cart right now. Please try again.
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
