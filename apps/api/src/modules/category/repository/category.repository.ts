import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CategoryStatus, CategoryVisibility } from "../constants";
import type { CategoryFilterOptions } from "../interfaces";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types";

/** Read options every single-category lookup accepts — `includeDeleted`
 * is only ever honored by the service for a caller with `category:read`
 * (see `service/category.service.ts`), never taken at face value from a
 * request. */
export interface CategoryLookupOptions {
  includeDeleted?: boolean;
}

/**
 * Persistence contract for the Category domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `CategoryPrismaRepository` for a test double (or
 * a different persistence layer entirely) never touches service code.
 */
export interface CategoryRepository {
  findById(id: string, options?: CategoryLookupOptions): Promise<Category | null>;
  findBySlug(slug: string, options?: CategoryLookupOptions): Promise<Category | null>;
  findAll(query: ParsedQuery, filters?: CategoryFilterOptions): Promise<PaginatedResult<Category>>;
  /** Direct children of `parentId` — `null` for the top-level categories. */
  findChildren(parentId: string | null, options?: CategoryLookupOptions): Promise<Category[]>;
  /** Every category matching `options`, unpaginated — the flat input
   * `utils/tree.util.ts`'s tree-building/descendant-collection
   * functions operate on. `includeDeleted: true` is required for
   * descendant collection to correctly walk through an already-deleted
   * intermediate node (see that module's doc comment); the tree-reading
   * endpoints instead pass `includeDeleted: false`. */
  findManyForTree(options?: CategoryLookupOptions): Promise<Category[]>;
  existsBySlug(slug: string): Promise<boolean>;
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: string, data: UpdateCategoryInput): Promise<Category>;
  updateStatus(id: string, status: CategoryStatus): Promise<Category>;
  updateVisibility(id: string, visibility: CategoryVisibility): Promise<Category>;
  /**
   * Soft-deletes `id` and every one of its descendants in a single
   * transaction (descendants are computed from the same
   * transaction-scoped read, so a concurrent re-parent can't leave the
   * cascade half-applied) — returns every id that was soft-deleted.
   */
  softDeleteWithDescendants(id: string): Promise<string[]>;
  /** Reverses `softDeleteWithDescendants` for `id` and every currently
   * soft-deleted descendant — returns every id that was restored. */
  restoreWithDescendants(id: string): Promise<string[]>;
}
