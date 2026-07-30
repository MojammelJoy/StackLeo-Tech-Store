import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CategoryFilterOptions } from "../interfaces";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types";

/**
 * Persistence contract for the Category domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `CategoryPrismaRepository` for a test double (or
 * a different persistence layer entirely) never touches service code.
 */
export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(query: ParsedQuery, filters?: CategoryFilterOptions): Promise<PaginatedResult<Category>>;
  /** Direct children of `parentId` — `null` for the top-level categories. */
  findChildren(parentId: string | null): Promise<Category[]>;
  existsBySlug(slug: string): Promise<boolean>;
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: string, data: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<void>;
}
