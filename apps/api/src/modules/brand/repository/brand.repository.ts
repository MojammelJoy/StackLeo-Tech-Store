import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { BrandFilterOptions } from "../interfaces";
import type { Brand, CreateBrandInput, UpdateBrandInput } from "../types";

/**
 * Persistence contract for the Brand domain entity. The service depends
 * on this interface, never on a concrete implementation directly, so
 * swapping `BrandPrismaRepository` for a test double (or a different
 * persistence layer entirely) never touches service code.
 */
export interface BrandRepository {
  findById(id: string): Promise<Brand | null>;
  findBySlug(slug: string): Promise<Brand | null>;
  findAll(query: ParsedQuery, filters?: BrandFilterOptions): Promise<PaginatedResult<Brand>>;
  existsBySlug(slug: string): Promise<boolean>;
  create(data: CreateBrandInput): Promise<Brand>;
  update(id: string, data: UpdateBrandInput): Promise<Brand>;
  delete(id: string): Promise<void>;
}
