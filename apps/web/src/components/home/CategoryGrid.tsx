"use client";

import { Container, Skeleton } from "@stackleo/ui";

import { useCategories } from "../../hooks/use-categories";

const PLACEHOLDER_TILE_COUNT = 6;

function CategorySkeletonGrid() {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: PLACEHOLDER_TILE_COUNT }, (_, index) => (
        <li key={index}>
          <Skeleton className="aspect-square w-full" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Shop-by-category section, backed by `GET /api/v1/categories`. Tiles are
 * plain (not `next/link`-wrapped) because no `/categories/[slug]`
 * destination page exists yet — wrapping them now would ship broken
 * links. `data-slug` marks the seam: once that route exists, swap the
 * `<div>` below for a `<Link href={`/categories/${category.slug}`}>`.
 */
export function CategoryGrid() {
  const { data: categories, isPending, isError, isFetching, refetch } = useCategories();

  return (
    <section aria-labelledby="shop-by-category-heading" className="py-16">
      <Container>
        <h2 id="shop-by-category-heading" className="text-2xl font-bold text-neutral-900">
          Shop by Category
        </h2>

        {isPending ? (
          <>
            <p className="mt-1 text-sm text-neutral-500">Loading categories…</p>
            <CategorySkeletonGrid />
          </>
        ) : isError ? (
          <div
            role="alert"
            className="mt-8 flex flex-col items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-6"
          >
            <p className="text-sm text-neutral-600">
              We couldn&apos;t load categories right now. Please try again.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50"
            >
              {isFetching ? "Retrying…" : "Retry"}
            </button>
          </div>
        ) : categories.length === 0 ? (
          <p className="mt-8 text-sm text-neutral-500">No categories available yet.</p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <li key={category.id}>
                <div
                  data-slug={category.slug}
                  className="flex aspect-square flex-col items-center justify-center rounded-lg bg-neutral-100 p-4 text-center transition-colors hover:bg-neutral-200"
                >
                  <span className="text-sm font-medium text-neutral-900">{category.name}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
