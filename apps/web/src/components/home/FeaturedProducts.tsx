import { Container, Skeleton } from "@stackleo/ui";

const PLACEHOLDER_CARD_COUNT = 8;

/**
 * Structural placeholder for the featured-products rail. Renders
 * product-card-shaped loading skeletons instead of hardcoded product data
 * — this section is wired to a real featured-products endpoint in a later
 * part, once one exists on the backend.
 */
export function FeaturedProducts() {
  return (
    <section aria-labelledby="featured-products-heading" className="bg-white py-16">
      <Container>
        <h2 id="featured-products-heading" className="text-2xl font-bold text-neutral-900">
          Featured Products
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Featured products will appear here once connected to the catalog.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PLACEHOLDER_CARD_COUNT }, (_, index) => (
            <li key={index} className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
