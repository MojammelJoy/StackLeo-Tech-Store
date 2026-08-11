import { Container } from "@stackleo/ui";

import { ProductNotFound } from "../../../components/product/ProductNotFound";

/** Rendered when `page.tsx` calls `notFound()` for a genuinely missing
 * product (real HTTP 404, correct for SEO) — reuses the same
 * `ProductNotFound` UI the client-side query falls back to if a
 * product disappears after the page has already loaded. */
export default function ProductNotFoundPage() {
  return (
    <Container className="py-10 sm:py-16">
      <ProductNotFound />
    </Container>
  );
}
