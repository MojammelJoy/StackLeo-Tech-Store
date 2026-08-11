import Link from "next/link";

/**
 * Rendered for a 404 from `GET /products/slug/:slug` — a genuinely
 * missing product and a hidden/inactive/deleted one are deliberately
 * indistinguishable at the API level (see apps/api's
 * `ProductService.getBySlug`), so this state covers all of those cases
 * with the same honest, non-leaking message.
 *
 * Uses a plain styled `<Link>` rather than wrapping `Button` — per
 * `Button`'s own doc comment, a link-styled-as-button should apply the
 * same variant/size classes directly instead of nesting an `<a>` inside
 * a `<button>`.
 */
export function ProductNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Product not found</h1>
      <p className="max-w-sm text-sm text-neutral-500">
        This product doesn&apos;t exist or is no longer available.
      </p>
      <Link
        href="/"
        className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-white transition-colors"
      >
        Continue shopping
      </Link>
    </div>
  );
}
