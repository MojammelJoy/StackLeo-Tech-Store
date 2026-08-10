import { Button } from "@stackleo/ui";
import Link from "next/link";

/** Links to "/" — the only storefront route guaranteed to exist today
 * (no "/shop" page has been built yet; see `Header.tsx`'s `NAV_LINKS`,
 * which are navigation-ready placeholders, not real destinations). */
export function EmptyCart() {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 text-center">
      <p className="text-lg font-medium text-neutral-900">Your cart is empty</p>
      <p className="text-sm text-neutral-500">Items you add to your cart will appear here.</p>
      <Link href="/" className="mt-2">
        <Button>Continue shopping</Button>
      </Link>
    </div>
  );
}
