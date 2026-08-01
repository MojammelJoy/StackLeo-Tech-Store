import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { BrandStatus, BrandVisibility } from "../constants";
import type { BrandFilterOptions } from "../interfaces";
import type { Brand, CreateBrandInput, UpdateBrandInput, UpdateBrandLogoInput } from "../types";

/** Read options every single-brand lookup accepts — `includeDeleted` is
 * only ever honored by the service for a caller with `brand:read` (see
 * `service/brand.service.ts`), never taken at face value from a
 * request. */
export interface BrandLookupOptions {
  includeDeleted?: boolean;
}

/**
 * Persistence contract for the Brand domain entity. The service depends
 * on this interface, never on a concrete implementation directly, so
 * swapping `BrandPrismaRepository` for a test double (or a different
 * persistence layer entirely) never touches service code.
 */
export interface BrandRepository {
  findById(id: string, options?: BrandLookupOptions): Promise<Brand | null>;
  findBySlug(slug: string, options?: BrandLookupOptions): Promise<Brand | null>;
  findAll(query: ParsedQuery, filters?: BrandFilterOptions): Promise<PaginatedResult<Brand>>;
  existsBySlug(slug: string): Promise<boolean>;
  create(data: CreateBrandInput): Promise<Brand>;
  update(id: string, data: UpdateBrandInput): Promise<Brand>;
  updateStatus(id: string, status: BrandStatus): Promise<Brand>;
  updateVisibility(id: string, visibility: BrandVisibility): Promise<Brand>;
  /** Sets/clears logo metadata and stamps `logoUpdatedAt` to "now" in
   * the same write. */
  updateLogo(id: string, data: UpdateBrandLogoInput): Promise<Brand>;
  /** Soft delete — sets `deletedAt`, never removes the row. */
  softDelete(id: string): Promise<void>;
  /** Reverses `softDelete` — clears `deletedAt`. */
  restore(id: string): Promise<void>;
}
