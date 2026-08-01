/**
 * A single display specification row attached to a `Product` — matches
 * the `ProductSpecification` model in `prisma/schema.prisma`.
 * `sortOrder` controls display order on a product page.
 */
export interface ProductSpecification {
  id: string;
  productId: string;
  key: string;
  value: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * One row of a full specification-set replacement — see
 * `ProductSpecificationRepository.replaceAll`, which this module
 * exposes as a single "replace the whole set" operation rather than
 * granular per-row CRUD (specifications are edited as a set, not
 * independently referenced elsewhere).
 */
export interface UpsertProductSpecificationInput {
  key: string;
  value: string;
  sortOrder?: number;
}
