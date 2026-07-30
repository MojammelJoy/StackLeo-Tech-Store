import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CreateBrandDto, UpdateBrandDto } from "../dto";
import type { BrandFilterOptions } from "../interfaces";
import type { BrandRepository } from "../repository";
import type { Brand } from "../types";

/**
 * Skeleton brand service — the operations a concrete implementation
 * will expose once brand persistence exists. Depends on
 * `BrandRepository` (interface only; see `repository/`), never on
 * Prisma directly, so this class never changes when the persistence
 * layer does. Every method throws `NotImplementedError` — no database
 * operations or business rules (slug uniqueness, etc.) happen in this
 * foundation.
 *
 * Write operations accept `actor: AuthenticatedUser` — the caller
 * performing the mutation — so a future concrete implementation can
 * attribute changes (audit logging, `createdBy`/`updatedBy`) without
 * every call site's signature changing later. Nothing here checks
 * `actor`'s permissions; that is `modules/rbac`'s job, applied by
 * whatever middleware sits in front of this service once it exists.
 */
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async findById(id: string): Promise<Brand | null> {
    throw new NotImplementedError(`BrandService.findById is not implemented yet (id: ${id})`);
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    throw new NotImplementedError(`BrandService.findBySlug is not implemented yet (slug: ${slug})`);
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: BrandFilterOptions,
  ): Promise<PaginatedResult<Brand>> {
    throw new NotImplementedError("BrandService.findAll is not implemented yet");
  }

  async create(_dto: CreateBrandDto, _actor: AuthenticatedUser): Promise<Brand> {
    throw new NotImplementedError("BrandService.create is not implemented yet");
  }

  async update(id: string, _dto: UpdateBrandDto, _actor: AuthenticatedUser): Promise<Brand> {
    throw new NotImplementedError(`BrandService.update is not implemented yet (id: ${id})`);
  }

  async delete(id: string, _actor: AuthenticatedUser): Promise<void> {
    throw new NotImplementedError(`BrandService.delete is not implemented yet (id: ${id})`);
  }
}
