import { ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { PERMISSIONS, userHasPermission } from "../../rbac";
import { BRAND_STATUSES, BRAND_VISIBILITIES } from "../constants";
import { brandMapper } from "../mapper";
import { generateUniqueSlug } from "../utils";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type {
  BrandResponseDto,
  CreateBrandDto,
  UpdateBrandDto,
  UpdateBrandLogoDto,
  UpdateBrandStatusDto,
  UpdateBrandVisibilityDto,
} from "../dto";
import type { BrandFilterOptions } from "../interfaces";
import type { BrandRepository } from "../repository";
import type { Brand } from "../types";

/**
 * Implements every Brand API operation: CRUD, soft delete + restore,
 * status/visibility transitions, logo metadata, and listing
 * (pagination, filtering, sorting, search). Depends on
 * `BrandRepository` (interface only; see `repository/`), never on
 * Prisma directly.
 *
 * `actor: AuthenticatedUser | null` on every read method is this
 * module's visibility enforcement hook, mirroring `modules/product`'s
 * `ProductService`/`modules/category`'s `CategoryService` exactly: a
 * caller without `brand:read` (every anonymous storefront request, and
 * any authenticated caller who isn't staff) only ever sees `ACTIVE` +
 * `PUBLIC`, non-deleted brands, regardless of what filters they pass —
 * see `scopeFiltersForActor`/`isVisibleTo`. Write methods take
 * `actor: AuthenticatedUser` (never null) since every mutating route
 * requires authentication + `brand:*` permission at the route layer;
 * this service still receives the actor to attribute changes in logs.
 */
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async list(
    query: ParsedQuery,
    filters: BrandFilterOptions,
    actor: AuthenticatedUser | null,
  ): Promise<PaginatedResult<BrandResponseDto>> {
    const scoped = this.scopeFiltersForActor(filters, actor);
    const result = await this.brandRepository.findAll(query, scoped);
    return { items: brandMapper.toResponseList(result.items), meta: result.meta };
  }

  async getById(id: string, actor: AuthenticatedUser | null): Promise<BrandResponseDto> {
    const canBypass = this.canBypassVisibilityScope(actor);
    const brand = await this.brandRepository.findById(id, { includeDeleted: canBypass });
    if (!brand || !this.isVisibleTo(brand, canBypass)) {
      throw new NotFoundError("Brand not found");
    }
    return brandMapper.toResponseDto(brand);
  }

  async getBySlug(slug: string, actor: AuthenticatedUser | null): Promise<BrandResponseDto> {
    const canBypass = this.canBypassVisibilityScope(actor);
    const brand = await this.brandRepository.findBySlug(slug, { includeDeleted: canBypass });
    if (!brand || !this.isVisibleTo(brand, canBypass)) {
      throw new NotFoundError("Brand not found");
    }
    return brandMapper.toResponseDto(brand);
  }

  async create(dto: CreateBrandDto, actor: AuthenticatedUser): Promise<BrandResponseDto> {
    const slug = dto.slug
      ? await this.assertSlugAvailable(dto.slug)
      : await generateUniqueSlug(dto.name, (candidate) =>
          this.brandRepository.existsBySlug(candidate),
        );

    const brand = await this.brandRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      status: dto.status,
      visibility: dto.visibility,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      seoKeywords: dto.seoKeywords,
    });

    logger.info({ brandId: brand.id, actorId: actor.id }, "Brand created");
    return brandMapper.toResponseDto(brand);
  }

  async update(
    id: string,
    dto: UpdateBrandDto,
    actor: AuthenticatedUser,
  ): Promise<BrandResponseDto> {
    const existing = await this.brandRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Brand not found");
    }

    const updated = await this.brandRepository.update(id, dto);
    logger.info({ brandId: id, actorId: actor.id }, "Brand updated");
    return brandMapper.toResponseDto(updated);
  }

  async updateStatus(
    id: string,
    dto: UpdateBrandStatusDto,
    actor: AuthenticatedUser,
  ): Promise<BrandResponseDto> {
    const existing = await this.brandRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Brand not found");
    }

    const updated = await this.brandRepository.updateStatus(id, dto.status);
    logger.info({ brandId: id, status: dto.status, actorId: actor.id }, "Brand status changed");
    return brandMapper.toResponseDto(updated);
  }

  async updateVisibility(
    id: string,
    dto: UpdateBrandVisibilityDto,
    actor: AuthenticatedUser,
  ): Promise<BrandResponseDto> {
    const existing = await this.brandRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Brand not found");
    }

    const updated = await this.brandRepository.updateVisibility(id, dto.visibility);
    logger.info(
      { brandId: id, visibility: dto.visibility, actorId: actor.id },
      "Brand visibility changed",
    );
    return brandMapper.toResponseDto(updated);
  }

  async updateLogo(
    id: string,
    dto: UpdateBrandLogoDto,
    actor: AuthenticatedUser,
  ): Promise<BrandResponseDto> {
    const existing = await this.brandRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Brand not found");
    }

    const updated = await this.brandRepository.updateLogo(id, dto);
    logger.info({ brandId: id, actorId: actor.id }, "Brand logo metadata updated");
    return brandMapper.toResponseDto(updated);
  }

  async delete(id: string, actor: AuthenticatedUser): Promise<void> {
    const existing = await this.brandRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Brand not found");
    }

    await this.brandRepository.softDelete(id);
    logger.info({ brandId: id, actorId: actor.id }, "Brand soft-deleted");
  }

  async restore(id: string, actor: AuthenticatedUser): Promise<BrandResponseDto> {
    const existing = await this.brandRepository.findById(id, { includeDeleted: true });
    if (!existing) {
      throw new NotFoundError("Brand not found");
    }
    if (!existing.deletedAt) {
      throw new ConflictError("Brand is not deleted");
    }

    await this.brandRepository.restore(id);
    const restored = await this.brandRepository.findById(id);
    if (!restored) {
      throw new NotFoundError("Brand not found");
    }

    logger.info({ brandId: id, actorId: actor.id }, "Brand restored");
    return brandMapper.toResponseDto(restored);
  }

  private async assertSlugAvailable(slug: string): Promise<string> {
    const exists = await this.brandRepository.existsBySlug(slug);
    if (exists) {
      throw new ConflictError(`A brand with slug "${slug}" already exists`);
    }
    return slug;
  }

  private canBypassVisibilityScope(actor: AuthenticatedUser | null): boolean {
    return actor !== null && userHasPermission(actor, PERMISSIONS.BRAND_READ);
  }

  private isVisibleTo(brand: Brand, canBypass: boolean): boolean {
    if (canBypass) {
      return true;
    }
    return brand.status === BRAND_STATUSES.ACTIVE && brand.visibility === BRAND_VISIBILITIES.PUBLIC;
  }

  private scopeFiltersForActor(
    filters: BrandFilterOptions,
    actor: AuthenticatedUser | null,
  ): BrandFilterOptions {
    if (this.canBypassVisibilityScope(actor)) {
      return filters;
    }
    return {
      ...filters,
      status: BRAND_STATUSES.ACTIVE,
      visibility: BRAND_VISIBILITIES.PUBLIC,
      includeDeleted: false,
    };
  }
}
