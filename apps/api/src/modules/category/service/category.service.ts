import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CreateCategoryDto, UpdateCategoryDto } from "../dto";
import type { CategoryFilterOptions } from "../interfaces";
import type { CategoryRepository } from "../repository";
import type { Category } from "../types";

/**
 * Skeleton category service — the operations a concrete implementation
 * will expose once category persistence exists. Depends on
 * `CategoryRepository` (interface only; see `repository/`), never on
 * Prisma directly, so this class never changes when the persistence
 * layer does. Every method throws `NotImplementedError` — no database
 * operations or business rules (slug uniqueness, hierarchy depth limits,
 * cascade behavior on delete, etc.) happen in this foundation.
 *
 * Write operations accept `actor: AuthenticatedUser` — the caller
 * performing the mutation — so a future concrete implementation can
 * attribute changes (audit logging, `createdBy`/`updatedBy`) without
 * every call site's signature changing later. Nothing here checks
 * `actor`'s permissions; that is `modules/rbac`'s job, applied by
 * whatever middleware sits in front of this service once it exists.
 */
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findById(id: string): Promise<Category | null> {
    throw new NotImplementedError(`CategoryService.findById is not implemented yet (id: ${id})`);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    throw new NotImplementedError(
      `CategoryService.findBySlug is not implemented yet (slug: ${slug})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: CategoryFilterOptions,
  ): Promise<PaginatedResult<Category>> {
    throw new NotImplementedError("CategoryService.findAll is not implemented yet");
  }

  async findChildren(parentId: string | null): Promise<Category[]> {
    throw new NotImplementedError(
      `CategoryService.findChildren is not implemented yet (parentId: ${parentId})`,
    );
  }

  async create(_dto: CreateCategoryDto, _actor: AuthenticatedUser): Promise<Category> {
    throw new NotImplementedError("CategoryService.create is not implemented yet");
  }

  async update(id: string, _dto: UpdateCategoryDto, _actor: AuthenticatedUser): Promise<Category> {
    throw new NotImplementedError(`CategoryService.update is not implemented yet (id: ${id})`);
  }

  async delete(id: string, _actor: AuthenticatedUser): Promise<void> {
    throw new NotImplementedError(`CategoryService.delete is not implemented yet (id: ${id})`);
  }
}
