import { ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { PERMISSIONS, userHasPermission } from "../../rbac";
import { CATEGORY_MAX_DEPTH, CATEGORY_STATUSES, CATEGORY_VISIBILITIES } from "../constants";
import { categoryMapper } from "../mapper";
import { buildCategoryForest, buildCategorySubtree, generateUniqueSlug } from "../utils";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type {
  CategoryResponseDto,
  CategoryTreeResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
  UpdateCategoryVisibilityDto,
} from "../dto";
import type { CategoryFilterOptions } from "../interfaces";
import type { CategoryRepository } from "../repository";
import type { Category } from "../types";

/**
 * Implements every Category API operation: CRUD, soft delete + restore
 * (both cascaded to descendants), status/visibility transitions,
 * listing (pagination, filtering, sorting, search), children lookup,
 * and the full tree/subtree. Depends on `CategoryRepository` (interface
 * only; see `repository/`), never on Prisma directly.
 *
 * `actor: AuthenticatedUser | null` on every read method is this
 * module's visibility enforcement hook, mirroring `modules/product`'s
 * `ProductService` exactly: a caller without `category:read` (every
 * anonymous storefront request, and any authenticated caller who isn't
 * staff) only ever sees `ACTIVE` + `PUBLIC`, non-deleted categories,
 * regardless of what filters they pass — see
 * `scopeFiltersForActor`/`isVisibleTo`. Write methods take
 * `actor: AuthenticatedUser` (never null) since every mutating route
 * requires authentication + `category:*` permission at the route layer;
 * this service still receives the actor to attribute changes in logs.
 */
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async list(
    query: ParsedQuery,
    filters: CategoryFilterOptions,
    actor: AuthenticatedUser | null,
  ): Promise<PaginatedResult<CategoryResponseDto>> {
    const scoped = this.scopeFiltersForActor(filters, actor);
    const result = await this.categoryRepository.findAll(query, scoped);
    return { items: categoryMapper.toResponseList(result.items), meta: result.meta };
  }

  async getById(id: string, actor: AuthenticatedUser | null): Promise<CategoryResponseDto> {
    const canBypass = this.canBypassVisibilityScope(actor);
    const category = await this.categoryRepository.findById(id, { includeDeleted: canBypass });
    if (!category || !this.isVisibleTo(category, canBypass)) {
      throw new NotFoundError("Category not found");
    }
    return categoryMapper.toResponseDto(category);
  }

  async getBySlug(slug: string, actor: AuthenticatedUser | null): Promise<CategoryResponseDto> {
    const canBypass = this.canBypassVisibilityScope(actor);
    const category = await this.categoryRepository.findBySlug(slug, { includeDeleted: canBypass });
    if (!category || !this.isVisibleTo(category, canBypass)) {
      throw new NotFoundError("Category not found");
    }
    return categoryMapper.toResponseDto(category);
  }

  /** Direct children of `parentId` (`null` for top-level). 404s for a
   * non-`null` `parentId` the caller isn't allowed to see, same as
   * `getById` — never a distinguishing error for "exists but hidden"
   * versus "doesn't exist". */
  async getChildren(
    parentId: string | null,
    actor: AuthenticatedUser | null,
  ): Promise<CategoryResponseDto[]> {
    const canBypass = this.canBypassVisibilityScope(actor);

    if (parentId !== null) {
      const parent = await this.categoryRepository.findById(parentId, {
        includeDeleted: canBypass,
      });
      if (!parent || !this.isVisibleTo(parent, canBypass)) {
        throw new NotFoundError("Category not found");
      }
    }

    const children = await this.categoryRepository.findChildren(parentId, {
      includeDeleted: canBypass,
    });
    const visible = canBypass
      ? children
      : children.filter((child) => this.isVisibleTo(child, false));
    return categoryMapper.toResponseList(visible);
  }

  /** The full forest — every top-level category and its descendants,
   * recursively. Built from one flat, unpaginated fetch (see
   * `utils/tree.util.ts`'s doc comment on why that beats one query per
   * tree level). */
  async getTree(actor: AuthenticatedUser | null): Promise<CategoryTreeResponseDto[]> {
    const scoped = await this.loadScopedTreeSource(actor);
    return categoryMapper.toTreeResponseList(buildCategoryForest(scoped));
  }

  /** A single subtree rooted at `id` (including `id` itself). 404s if
   * `id` doesn't exist *or* isn't visible to `actor` — `id` simply
   * won't be present in the scoped source set either way. */
  async getSubtree(id: string, actor: AuthenticatedUser | null): Promise<CategoryTreeResponseDto> {
    const scoped = await this.loadScopedTreeSource(actor);
    const node = buildCategorySubtree(scoped, id);
    if (!node) {
      throw new NotFoundError("Category not found");
    }
    return categoryMapper.toTreeResponseDto(node);
  }

  async create(dto: CreateCategoryDto, actor: AuthenticatedUser): Promise<CategoryResponseDto> {
    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundError("Parent category not found");
      }
      await this.assertDepthWithinLimit(parent);
    }

    const slug = dto.slug
      ? await this.assertSlugAvailable(dto.slug)
      : await generateUniqueSlug(dto.name, (candidate) =>
          this.categoryRepository.existsBySlug(candidate),
        );

    const category = await this.categoryRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      parentId: dto.parentId,
      status: dto.status,
      visibility: dto.visibility,
      sortOrder: dto.sortOrder,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      seoKeywords: dto.seoKeywords,
    });

    logger.info({ categoryId: category.id, actorId: actor.id }, "Category created");
    return categoryMapper.toResponseDto(category);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    actor: AuthenticatedUser,
  ): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    if (dto.parentId !== undefined && dto.parentId !== existing.parentId && dto.parentId !== null) {
      const newParent = await this.categoryRepository.findById(dto.parentId);
      if (!newParent) {
        throw new NotFoundError("Parent category not found");
      }
      await this.assertNoCycle(id, newParent);
      await this.assertDepthWithinLimit(newParent);
    }

    const updated = await this.categoryRepository.update(id, dto);
    logger.info({ categoryId: id, actorId: actor.id }, "Category updated");
    return categoryMapper.toResponseDto(updated);
  }

  async updateStatus(
    id: string,
    dto: UpdateCategoryStatusDto,
    actor: AuthenticatedUser,
  ): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const updated = await this.categoryRepository.updateStatus(id, dto.status);
    logger.info(
      { categoryId: id, status: dto.status, actorId: actor.id },
      "Category status changed",
    );
    return categoryMapper.toResponseDto(updated);
  }

  async updateVisibility(
    id: string,
    dto: UpdateCategoryVisibilityDto,
    actor: AuthenticatedUser,
  ): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const updated = await this.categoryRepository.updateVisibility(id, dto.visibility);
    logger.info(
      { categoryId: id, visibility: dto.visibility, actorId: actor.id },
      "Category visibility changed",
    );
    return categoryMapper.toResponseDto(updated);
  }

  /** Soft-deletes `id` and its entire subtree — a hidden/removed parent
   * category taking its subcategories down with it, not leaving them
   * dangling as reachable-but-orphaned. */
  async delete(id: string, actor: AuthenticatedUser): Promise<void> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const deletedIds = await this.categoryRepository.softDeleteWithDescendants(id);
    logger.info(
      { categoryId: id, cascadedCount: deletedIds.length - 1, actorId: actor.id },
      "Category soft-deleted (cascaded to descendants)",
    );
  }

  /** Reverses `delete`, restoring `id` and its entire subtree. Refuses
   * to restore a category whose parent is itself deleted or missing —
   * that would resurrect a node into a hidden/broken position in the
   * tree; the parent must be restored first. */
  async restore(id: string, actor: AuthenticatedUser): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findById(id, { includeDeleted: true });
    if (!existing) {
      throw new NotFoundError("Category not found");
    }
    if (!existing.deletedAt) {
      throw new ConflictError("Category is not deleted");
    }

    if (existing.parentId) {
      const parent = await this.categoryRepository.findById(existing.parentId);
      if (!parent) {
        throw new ConflictError(
          "Cannot restore a category whose parent is deleted or missing; restore the parent first",
        );
      }
    }

    const restoredIds = await this.categoryRepository.restoreWithDescendants(id);
    const restored = await this.categoryRepository.findById(id);
    if (!restored) {
      throw new NotFoundError("Category not found");
    }

    logger.info(
      { categoryId: id, cascadedCount: restoredIds.length - 1, actorId: actor.id },
      "Category restored (cascaded to descendants)",
    );
    return categoryMapper.toResponseDto(restored);
  }

  private async loadScopedTreeSource(actor: AuthenticatedUser | null): Promise<Category[]> {
    const canBypass = this.canBypassVisibilityScope(actor);
    const categories = await this.categoryRepository.findManyForTree({ includeDeleted: false });
    return canBypass
      ? categories
      : categories.filter((category) => this.isVisibleTo(category, false));
  }

  private async assertSlugAvailable(slug: string): Promise<string> {
    const exists = await this.categoryRepository.existsBySlug(slug);
    if (exists) {
      throw new ConflictError(`A category with slug "${slug}" already exists`);
    }
    return slug;
  }

  /** Walks from `newParent` up to the root, rejecting the move if
   * `categoryId` appears anywhere in that chain — that would mean
   * `newParent` is a descendant of `categoryId`, so assigning it as the
   * parent would create a cycle. */
  private async assertNoCycle(categoryId: string, newParent: Category): Promise<void> {
    if (newParent.id === categoryId) {
      throw new ConflictError("A category cannot be its own parent");
    }

    let current: Category | null = newParent;
    while (current) {
      if (current.id === categoryId) {
        throw new ConflictError("A category cannot be moved under one of its own descendants");
      }
      current = current.parentId
        ? await this.categoryRepository.findById(current.parentId, { includeDeleted: true })
        : null;
    }
  }

  /** Depth is 0 for a top-level category. Only checks how deep `parent`
   * itself sits — not the depth of any subtree already under the
   * category being created/moved, which a very deep re-parented subtree
   * could in principle still push past `CATEGORY_MAX_DEPTH` further
   * down. A deliberate, documented simplification: fully accounting for
   * the moved subtree's own depth would need a second traversal for a
   * case this API has no way to construct more than a few levels deep
   * anyway (the same limit already applies every time a level is
   * added). */
  private async assertDepthWithinLimit(parent: Category): Promise<void> {
    const parentDepth = await this.computeDepth(parent);
    if (parentDepth + 1 > CATEGORY_MAX_DEPTH) {
      throw new ConflictError(`Category hierarchy cannot exceed ${CATEGORY_MAX_DEPTH} levels`);
    }
  }

  private async computeDepth(category: Category): Promise<number> {
    let depth = 0;
    let current = category;
    while (current.parentId) {
      const next = await this.categoryRepository.findById(current.parentId, {
        includeDeleted: true,
      });
      if (!next) {
        break;
      }
      current = next;
      depth += 1;
    }
    return depth;
  }

  private canBypassVisibilityScope(actor: AuthenticatedUser | null): boolean {
    return actor !== null && userHasPermission(actor, PERMISSIONS.CATEGORY_READ);
  }

  private isVisibleTo(category: Category, canBypass: boolean): boolean {
    if (canBypass) {
      return true;
    }
    return (
      category.status === CATEGORY_STATUSES.ACTIVE &&
      category.visibility === CATEGORY_VISIBILITIES.PUBLIC
    );
  }

  private scopeFiltersForActor(
    filters: CategoryFilterOptions,
    actor: AuthenticatedUser | null,
  ): CategoryFilterOptions {
    if (this.canBypassVisibilityScope(actor)) {
      return filters;
    }
    return {
      ...filters,
      status: CATEGORY_STATUSES.ACTIVE,
      visibility: CATEGORY_VISIBILITIES.PUBLIC,
      includeDeleted: false,
    };
  }
}
