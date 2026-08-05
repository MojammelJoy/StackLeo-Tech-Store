import { Prisma } from "@prisma/client";

import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { InternalServerError } from "../../../errors";
import {
  SEARCH_ENTITY_TYPES,
  SEARCH_VISIBLE_STATUS,
  SEARCH_VISIBLE_VISIBILITY,
} from "../constants";

import type { FilterParams, PaginatedResult, SortParam } from "../../../common";
import type { SearchEntityType } from "../constants";
import type {
  AutocompleteQuery,
  EntityVisibilityScope,
  SearchQuery,
  SearchResultItem,
  SearchSuggestion,
} from "../types";
import type { SearchRepository } from "./search.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * How many rows this repository will fetch *per entity type* when a
 * search spans more than one (`SearchQuery.entityTypes.length > 1`).
 * Cross-entity results are ranked and paginated in application memory
 * (see `searchMultipleEntities`'s doc comment for why), which only
 * stays cheap and bounded with a fetch cap — an unbounded fetch would
 * let a deep page number force a full table scan per entity type. A
 * single-entity search (the common case — plain product search) never
 * hits this cap: it pushes pagination straight to the database.
 */
const MULTI_ENTITY_FETCH_CAP = 200;

/** The `MediaAsset` lifecycle's "usable" status — duplicated as a bare
 * string rather than importing `modules/media`'s `MEDIA_STATUSES`, the
 * same decoupling this foundation applies to `modules/product`/
 * `modules/category`/`modules/brand` (see `search.constants.ts`'s doc
 * comment on `SEARCH_VISIBLE_STATUS`). */
const MEDIA_READY_STATUS = "ready";

/** `MediaAsset.ownerType`/`MediaAsset.purpose` pairs this repository
 * reads a representative image from for each search entity type —
 * mirrors `modules/media`'s `MEDIA_OWNER_TYPES`/`MEDIA_PURPOSES` values
 * without importing them, same rationale as `MEDIA_READY_STATUS`. */
const MEDIA_OWNER_BY_ENTITY: Record<SearchEntityType, { ownerType: string; purpose: string }> = {
  [SEARCH_ENTITY_TYPES.PRODUCT]: { ownerType: "product", purpose: "product_image" },
  [SEARCH_ENTITY_TYPES.CATEGORY]: { ownerType: "category", purpose: "category_image" },
  [SEARCH_ENTITY_TYPES.BRAND]: { ownerType: "brand", purpose: "brand_logo" },
};

interface ProductSearchRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  tags: string[];
}

interface CategorySearchRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface BrandSearchRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/** Resolves what `status`/`visibility` a given entity type's rows must
 * be filtered to. A map entry of `null` means the actor already holds
 * that entity type's own `*_READ` permission (see
 * `service/search.service.ts`) and may see every status/visibility; a
 * missing map (or a missing entry for this entity type) fails closed to
 * `SEARCH_VISIBLE_STATUS`/`SEARCH_VISIBLE_VISIBILITY` rather than
 * assuming unscoped access — this repository never trusts an absent
 * scope as "no restriction". */
function resolveEntityVisibility(
  visibilityScope: Partial<Record<SearchEntityType, EntityVisibilityScope | null>> | undefined,
  entityType: SearchEntityType,
): EntityVisibilityScope | null {
  if (visibilityScope && entityType in visibilityScope) {
    return visibilityScope[entityType] ?? null;
  }
  return { status: SEARCH_VISIBLE_STATUS, visibility: SEARCH_VISIBLE_VISIBILITY };
}

function extractStringFilter(
  filters: FilterParams,
  field: string,
): { equals: string } | { in: string[] } | undefined {
  const condition = filters[field];
  if (!condition) return undefined;
  if (condition.operator === "in" && Array.isArray(condition.value)) {
    return { in: condition.value.map(String) };
  }
  return { equals: String(condition.value) };
}

/** Same intent as `extractStringFilter`, but producing a raw SQL
 * fragment for the full-text queries below instead of a Prisma `where`
 * value. `column` is always one of this file's own hardcoded column
 * name literals — never user input — so `Prisma.raw(column)` is safe;
 * only the filter's *value(s)* (user input) are parameterized. */
function buildRawEqOrInCondition(
  column: string,
  filters: FilterParams,
  field: string,
): Prisma.Sql | null {
  const condition = filters[field];
  if (!condition) return null;
  if (condition.operator === "in" && Array.isArray(condition.value)) {
    const values = condition.value.map(String);
    if (values.length === 0) return null;
    return Prisma.sql`${Prisma.raw(column)} IN (${Prisma.join(values)})`;
  }
  return Prisma.sql`${Prisma.raw(column)} = ${String(condition.value)}`;
}

function scoreTextMatch(keyword: string, ...fields: Array<string | null | undefined>): number {
  const normalizedKeyword = keyword.trim().toLowerCase();
  let best = 0;
  for (const field of fields) {
    if (!field) continue;
    const value = field.toLowerCase();
    if (value === normalizedKeyword) best = Math.max(best, 3);
    else if (value.startsWith(normalizedKeyword)) best = Math.max(best, 2);
    else if (value.includes(normalizedKeyword)) best = Math.max(best, 1);
  }
  return best;
}

/** Every score function floors at `1`: the row only ever reaches this
 * function because the entity's own `WHERE` clause already required a
 * real match on at least one field (see `buildProductWhere` etc.), so
 * `scoreTextMatch` finding `0` here would only mean the match came from
 * a field the score heuristic doesn't weigh directly (e.g. a product's
 * `tags` array). */
function scoreProduct(keyword: string, product: ProductSearchRow): number {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const tagScore = product.tags.some((tag) => tag.toLowerCase() === normalizedKeyword) ? 2 : 0;
  return Math.max(
    1,
    scoreTextMatch(keyword, product.name, product.sku, product.slug, product.description),
    tagScore,
  );
}

function scoreCategory(keyword: string, category: CategorySearchRow): number {
  return Math.max(1, scoreTextMatch(keyword, category.name, category.slug, category.description));
}

function scoreBrand(keyword: string, brand: BrandSearchRow): number {
  return Math.max(1, scoreTextMatch(keyword, brand.name, brand.slug, brand.description));
}

function toResultItem(
  entityType: SearchEntityType,
  row: { id: string; name: string; slug: string; description: string | null },
  score: number,
  imageUrl: string | null,
): SearchResultItem {
  return {
    id: row.id,
    entityType,
    title: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl,
    score,
  };
}

/** One batched `MediaAsset` lookup for every row about to be returned,
 * rather than one query per row — the `SearchResultItem.imageUrl` a
 * search result needs. Picks the oldest `ready` asset for each
 * `(ownerType, ownerId)` pair as "the" representative image, mirroring
 * `MediaPrismaRepository.findByOwner`'s own `createdAt` ordering. */
async function loadImageUrls(
  prismaClient: PrismaClient,
  rows: Array<{ entityType: SearchEntityType; id: string }>,
): Promise<Map<string, string>> {
  const idsByEntity = new Map<SearchEntityType, string[]>();
  for (const row of rows) {
    const ids = idsByEntity.get(row.entityType) ?? [];
    ids.push(row.id);
    idsByEntity.set(row.entityType, ids);
  }

  const ownerConditions = Array.from(idsByEntity.entries()).map(([entityType, ids]) => {
    const owner = MEDIA_OWNER_BY_ENTITY[entityType];
    return { ownerType: owner.ownerType, purpose: owner.purpose, ownerId: { in: ids } };
  });
  if (ownerConditions.length === 0) {
    return new Map();
  }

  const assets = await prismaClient.mediaAsset.findMany({
    where: { status: MEDIA_READY_STATUS, OR: ownerConditions },
    orderBy: { createdAt: "asc" },
    select: { ownerType: true, ownerId: true, url: true },
  });

  const imageByOwner = new Map<string, string>();
  for (const asset of assets) {
    if (!asset.ownerType || !asset.ownerId) continue;
    const key = `${asset.ownerType}:${asset.ownerId}`;
    if (!imageByOwner.has(key)) {
      imageByOwner.set(key, asset.url);
    }
  }
  return imageByOwner;
}

function imageKey(entityType: SearchEntityType, id: string): string {
  const owner = MEDIA_OWNER_BY_ENTITY[entityType];
  return `${owner.ownerType}:${id}`;
}

function buildProductWhere(
  query: SearchQuery,
  stockCondition: Prisma.ProductWhereInput | null,
): Prisma.ProductWhereInput {
  const conditions: Prisma.ProductWhereInput[] = [{ deletedAt: null }];

  const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.PRODUCT);
  if (scope) {
    conditions.push({ status: scope.status, visibility: scope.visibility });
  } else {
    const status = extractStringFilter(query.filters, "status");
    if (status) conditions.push({ status });
    const visibility = extractStringFilter(query.filters, "visibility");
    if (visibility) conditions.push({ visibility });
  }

  const categoryId = extractStringFilter(query.filters, "categoryId");
  if (categoryId) conditions.push({ categoryId });
  const brandId = extractStringFilter(query.filters, "brandId");
  if (brandId) conditions.push({ brandId });

  if (query.priceMin !== undefined) conditions.push({ price: { gte: query.priceMin } });
  if (query.priceMax !== undefined) conditions.push({ price: { lte: query.priceMax } });

  if (stockCondition) conditions.push(stockCondition);

  conditions.push({
    OR: [
      { name: { contains: query.keyword, mode: "insensitive" } },
      { description: { contains: query.keyword, mode: "insensitive" } },
      { sku: { contains: query.keyword, mode: "insensitive" } },
      { slug: { contains: query.keyword, mode: "insensitive" } },
      { tags: { has: query.keyword } },
    ],
  });

  return { AND: conditions };
}

function buildCategoryWhere(query: SearchQuery): Prisma.CategoryWhereInput {
  const conditions: Prisma.CategoryWhereInput[] = [{ deletedAt: null }];

  const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.CATEGORY);
  if (scope) {
    conditions.push({ status: scope.status, visibility: scope.visibility });
  } else {
    const status = extractStringFilter(query.filters, "status");
    if (status) conditions.push({ status });
    const visibility = extractStringFilter(query.filters, "visibility");
    if (visibility) conditions.push({ visibility });
  }

  const parentId = extractStringFilter(query.filters, "parentId");
  if (parentId) conditions.push({ parentId });

  conditions.push({
    OR: [
      { name: { contains: query.keyword, mode: "insensitive" } },
      { description: { contains: query.keyword, mode: "insensitive" } },
      { slug: { contains: query.keyword, mode: "insensitive" } },
    ],
  });

  return { AND: conditions };
}

function buildBrandWhere(query: SearchQuery): Prisma.BrandWhereInput {
  const conditions: Prisma.BrandWhereInput[] = [{ deletedAt: null }];

  const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.BRAND);
  if (scope) {
    conditions.push({ status: scope.status, visibility: scope.visibility });
  } else {
    const status = extractStringFilter(query.filters, "status");
    if (status) conditions.push({ status });
    const visibility = extractStringFilter(query.filters, "visibility");
    if (visibility) conditions.push({ visibility });
  }

  conditions.push({
    OR: [
      { name: { contains: query.keyword, mode: "insensitive" } },
      { description: { contains: query.keyword, mode: "insensitive" } },
      { slug: { contains: query.keyword, mode: "insensitive" } },
    ],
  });

  return { AND: conditions };
}

/** Always appends an `id` tiebreaker, mirroring every other module's
 * Prisma repository — relevance (score) ordering is applied in
 * application code after fetch, not through `orderBy`, so these only
 * matter when `query.sort` carries an explicit field sort. */
function buildProductOrderBy(sort: SortParam[]): Prisma.ProductOrderByWithRelationInput[] {
  if (sort.length === 0) return [{ createdAt: "desc" }, { id: "asc" }];
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}

function buildCategoryOrderBy(sort: SortParam[]): Prisma.CategoryOrderByWithRelationInput[] {
  if (sort.length === 0) return [{ createdAt: "desc" }, { id: "asc" }];
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}

function buildBrandOrderBy(sort: SortParam[]): Prisma.BrandOrderByWithRelationInput[] {
  if (sort.length === 0) return [{ createdAt: "desc" }, { id: "asc" }];
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}

/**
 * Prisma-backed implementation of `SearchRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 *
 * `Product`/`Category`/`Brand` have no Prisma relations to each other
 * (see `prisma/schema.prisma`'s doc comments — `categoryId`/`brandId`/
 * `parentId` are all bare FK-shaped fields), so a cross-entity search
 * runs one independent query per requested entity type rather than a
 * single joined query. `search`/`suggest` use simple case-insensitive
 * `contains` matching; `searchFullText`/`suggestFullText` use Postgres's
 * native `tsvector`/`plainto_tsquery`/`ts_rank` via `$queryRaw` — both
 * strategies stay entirely within this Postgres database (no
 * Elasticsearch/Meilisearch/Algolia).
 */
export class SearchPrismaRepository implements SearchRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async search(query: SearchQuery): Promise<PaginatedResult<SearchResultItem>> {
    return this.executeSearch(query, false);
  }

  async searchFullText(query: SearchQuery): Promise<PaginatedResult<SearchResultItem>> {
    return this.executeSearch(query, true);
  }

  async suggest(query: AutocompleteQuery): Promise<SearchSuggestion[]> {
    return this.buildSuggestions(query, false);
  }

  async suggestFullText(query: AutocompleteQuery): Promise<SearchSuggestion[]> {
    return this.buildSuggestions(query, true);
  }

  private async executeSearch(
    query: SearchQuery,
    fullText: boolean,
  ): Promise<PaginatedResult<SearchResultItem>> {
    const stockCondition =
      !fullText && query.entityTypes.includes(SEARCH_ENTITY_TYPES.PRODUCT)
        ? await this.buildStockCondition(query.inStock)
        : null;

    if (query.entityTypes.length === 1) {
      const [entityType] = query.entityTypes;
      if (!entityType) {
        return { items: [], meta: buildPaginationMeta(query.pagination, 0) };
      }
      const { skip, take } = getPaginationOffset(query.pagination);
      const { items, total } = await this.searchEntity(
        entityType,
        query,
        stockCondition,
        skip,
        take,
        fullText,
      );
      return { items, meta: buildPaginationMeta(query.pagination, total) };
    }

    return this.searchMultipleEntities(query, stockCondition, fullText);
  }

  /**
   * Cross-entity search has no single table to `ORDER BY`/`LIMIT`/
   * `OFFSET` against — `Product`/`Category`/`Brand` are queried
   * independently (see this class's doc comment) and must be merged by
   * relevance afterward. Each entity type's query fetches up to
   * `MULTI_ENTITY_FETCH_CAP` rows (never the full table), the results
   * are merged and sorted by `score` in memory, then sliced to the
   * requested page. `totalItems` is still exact (a separate `COUNT(*)`
   * per entity type), but a page number deep enough that
   * `page * limit` exceeds the fetch cap may return fewer items than
   * `totalItems` implies — see this module's README-equivalent (the
   * Search API's own docs) for that tradeoff; it only affects
   * multi-entity searches paginated unusually deep, never a
   * single-entity search (product-only, category-only, or brand-only),
   * which always pushes pagination to the database exactly.
   */
  private async searchMultipleEntities(
    query: SearchQuery,
    stockCondition: Prisma.ProductWhereInput | null,
    fullText: boolean,
  ): Promise<PaginatedResult<SearchResultItem>> {
    const { page, limit } = query.pagination;
    const fetchTake = Math.min(page * limit, MULTI_ENTITY_FETCH_CAP);
    const relevanceQuery: SearchQuery = { ...query, sort: [] };

    const results = await Promise.all(
      query.entityTypes.map((entityType) =>
        this.searchEntity(entityType, relevanceQuery, stockCondition, 0, fetchTake, fullText),
      ),
    );

    const merged = results.flatMap((result) => result.items);
    merged.sort((a, b) => b.score - a.score);

    const totalItems = results.reduce((sum, result) => sum + result.total, 0);
    const start = (page - 1) * limit;
    const items = merged.slice(start, start + limit);

    return { items, meta: buildPaginationMeta(query.pagination, totalItems) };
  }

  private async searchEntity(
    entityType: SearchEntityType,
    query: SearchQuery,
    stockCondition: Prisma.ProductWhereInput | null,
    skip: number,
    take: number,
    fullText: boolean,
  ): Promise<{ items: SearchResultItem[]; total: number }> {
    switch (entityType) {
      case SEARCH_ENTITY_TYPES.PRODUCT:
        return fullText
          ? this.searchProductsFullText(query, skip, take)
          : this.searchProductsPattern(query, stockCondition, skip, take);
      case SEARCH_ENTITY_TYPES.CATEGORY:
        return fullText
          ? this.searchCategoriesFullText(query, skip, take)
          : this.searchCategoriesPattern(query, skip, take);
      case SEARCH_ENTITY_TYPES.BRAND:
        return fullText
          ? this.searchBrandsFullText(query, skip, take)
          : this.searchBrandsPattern(query, skip, take);
      default: {
        const exhaustiveCheck: never = entityType;
        throw new InternalServerError(`Unsupported search entity type: ${String(exhaustiveCheck)}`);
      }
    }
  }

  private async searchProductsPattern(
    query: SearchQuery,
    stockCondition: Prisma.ProductWhereInput | null,
    skip: number,
    take: number,
  ): Promise<{ items: SearchResultItem[]; total: number }> {
    const where = buildProductWhere(query, stockCondition);
    const orderBy = buildProductOrderBy(query.sort);
    const [rows, total] = await Promise.all([
      this.prismaClient.product.findMany({
        where,
        orderBy,
        skip,
        take,
        select: { id: true, name: true, slug: true, description: true, sku: true, tags: true },
      }),
      this.prismaClient.product.count({ where }),
    ]);

    const imageMap = await loadImageUrls(
      this.prismaClient,
      rows.map((row) => ({ entityType: SEARCH_ENTITY_TYPES.PRODUCT, id: row.id })),
    );
    const items = rows.map((row) =>
      toResultItem(
        SEARCH_ENTITY_TYPES.PRODUCT,
        row,
        scoreProduct(query.keyword, row),
        imageMap.get(imageKey(SEARCH_ENTITY_TYPES.PRODUCT, row.id)) ?? null,
      ),
    );
    return { items, total };
  }

  private async searchCategoriesPattern(
    query: SearchQuery,
    skip: number,
    take: number,
  ): Promise<{ items: SearchResultItem[]; total: number }> {
    const where = buildCategoryWhere(query);
    const orderBy = buildCategoryOrderBy(query.sort);
    const [rows, total] = await Promise.all([
      this.prismaClient.category.findMany({
        where,
        orderBy,
        skip,
        take,
        select: { id: true, name: true, slug: true, description: true },
      }),
      this.prismaClient.category.count({ where }),
    ]);

    const imageMap = await loadImageUrls(
      this.prismaClient,
      rows.map((row) => ({ entityType: SEARCH_ENTITY_TYPES.CATEGORY, id: row.id })),
    );
    const items = rows.map((row) =>
      toResultItem(
        SEARCH_ENTITY_TYPES.CATEGORY,
        row,
        scoreCategory(query.keyword, row),
        imageMap.get(imageKey(SEARCH_ENTITY_TYPES.CATEGORY, row.id)) ?? null,
      ),
    );
    return { items, total };
  }

  private async searchBrandsPattern(
    query: SearchQuery,
    skip: number,
    take: number,
  ): Promise<{ items: SearchResultItem[]; total: number }> {
    const where = buildBrandWhere(query);
    const orderBy = buildBrandOrderBy(query.sort);
    const [rows, total] = await Promise.all([
      this.prismaClient.brand.findMany({
        where,
        orderBy,
        skip,
        take,
        select: { id: true, name: true, slug: true, description: true },
      }),
      this.prismaClient.brand.count({ where }),
    ]);

    const imageMap = await loadImageUrls(
      this.prismaClient,
      rows.map((row) => ({ entityType: SEARCH_ENTITY_TYPES.BRAND, id: row.id })),
    );
    const items = rows.map((row) =>
      toResultItem(
        SEARCH_ENTITY_TYPES.BRAND,
        row,
        scoreBrand(query.keyword, row),
        imageMap.get(imageKey(SEARCH_ENTITY_TYPES.BRAND, row.id)) ?? null,
      ),
    );
    return { items, total };
  }

  private async searchProductsFullText(
    query: SearchQuery,
    skip: number,
    take: number,
  ): Promise<{ items: SearchResultItem[]; total: number }> {
    const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.PRODUCT);
    const conditions: Prisma.Sql[] = [Prisma.sql`deleted_at IS NULL`];

    if (scope) {
      conditions.push(
        Prisma.sql`status = ${scope.status}`,
        Prisma.sql`visibility = ${scope.visibility}`,
      );
    } else {
      const status = buildRawEqOrInCondition("status", query.filters, "status");
      if (status) conditions.push(status);
      const visibility = buildRawEqOrInCondition("visibility", query.filters, "visibility");
      if (visibility) conditions.push(visibility);
    }

    const categoryId = buildRawEqOrInCondition("category_id", query.filters, "categoryId");
    if (categoryId) conditions.push(categoryId);
    const brandId = buildRawEqOrInCondition("brand_id", query.filters, "brandId");
    if (brandId) conditions.push(brandId);

    if (query.priceMin !== undefined) conditions.push(Prisma.sql`price >= ${query.priceMin}`);
    if (query.priceMax !== undefined) conditions.push(Prisma.sql`price <= ${query.priceMax}`);

    if (query.inStock !== undefined) {
      conditions.push(await this.buildRawStockCondition(query.inStock));
    }

    const tsVector = Prisma.sql`to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(sku,'') || ' ' || coalesce(slug,''))`;
    const tsQuery = Prisma.sql`plainto_tsquery('english', ${query.keyword})`;
    conditions.push(Prisma.sql`${tsVector} @@ ${tsQuery}`);

    const whereClause = Prisma.join(conditions, " AND ");

    const [rows, countRows] = await Promise.all([
      this.prismaClient.$queryRaw<Array<ProductSearchRow & { rank: number }>>`
        SELECT id, name, slug, description, sku, tags, ts_rank(${tsVector}, ${tsQuery}) AS rank
        FROM products
        WHERE ${whereClause}
        ORDER BY rank DESC
        LIMIT ${take} OFFSET ${skip}
      `,
      this.prismaClient.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count FROM products WHERE ${whereClause}
      `,
    ]);

    const imageMap = await loadImageUrls(
      this.prismaClient,
      rows.map((row) => ({ entityType: SEARCH_ENTITY_TYPES.PRODUCT, id: row.id })),
    );
    const items = rows.map((row) =>
      toResultItem(
        SEARCH_ENTITY_TYPES.PRODUCT,
        row,
        row.rank,
        imageMap.get(imageKey(SEARCH_ENTITY_TYPES.PRODUCT, row.id)) ?? null,
      ),
    );
    return { items, total: Number(countRows[0]?.count ?? 0) };
  }

  private async searchCategoriesFullText(
    query: SearchQuery,
    skip: number,
    take: number,
  ): Promise<{ items: SearchResultItem[]; total: number }> {
    const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.CATEGORY);
    const conditions: Prisma.Sql[] = [Prisma.sql`deleted_at IS NULL`];

    if (scope) {
      conditions.push(
        Prisma.sql`status = ${scope.status}`,
        Prisma.sql`visibility = ${scope.visibility}`,
      );
    } else {
      const status = buildRawEqOrInCondition("status", query.filters, "status");
      if (status) conditions.push(status);
      const visibility = buildRawEqOrInCondition("visibility", query.filters, "visibility");
      if (visibility) conditions.push(visibility);
    }

    const parentId = buildRawEqOrInCondition("parent_id", query.filters, "parentId");
    if (parentId) conditions.push(parentId);

    const tsVector = Prisma.sql`to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(slug,''))`;
    const tsQuery = Prisma.sql`plainto_tsquery('english', ${query.keyword})`;
    conditions.push(Prisma.sql`${tsVector} @@ ${tsQuery}`);

    const whereClause = Prisma.join(conditions, " AND ");

    const [rows, countRows] = await Promise.all([
      this.prismaClient.$queryRaw<Array<CategorySearchRow & { rank: number }>>`
        SELECT id, name, slug, description, ts_rank(${tsVector}, ${tsQuery}) AS rank
        FROM categories
        WHERE ${whereClause}
        ORDER BY rank DESC
        LIMIT ${take} OFFSET ${skip}
      `,
      this.prismaClient.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count FROM categories WHERE ${whereClause}
      `,
    ]);

    const imageMap = await loadImageUrls(
      this.prismaClient,
      rows.map((row) => ({ entityType: SEARCH_ENTITY_TYPES.CATEGORY, id: row.id })),
    );
    const items = rows.map((row) =>
      toResultItem(
        SEARCH_ENTITY_TYPES.CATEGORY,
        row,
        row.rank,
        imageMap.get(imageKey(SEARCH_ENTITY_TYPES.CATEGORY, row.id)) ?? null,
      ),
    );
    return { items, total: Number(countRows[0]?.count ?? 0) };
  }

  private async searchBrandsFullText(
    query: SearchQuery,
    skip: number,
    take: number,
  ): Promise<{ items: SearchResultItem[]; total: number }> {
    const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.BRAND);
    const conditions: Prisma.Sql[] = [Prisma.sql`deleted_at IS NULL`];

    if (scope) {
      conditions.push(
        Prisma.sql`status = ${scope.status}`,
        Prisma.sql`visibility = ${scope.visibility}`,
      );
    } else {
      const status = buildRawEqOrInCondition("status", query.filters, "status");
      if (status) conditions.push(status);
      const visibility = buildRawEqOrInCondition("visibility", query.filters, "visibility");
      if (visibility) conditions.push(visibility);
    }

    const tsVector = Prisma.sql`to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(slug,''))`;
    const tsQuery = Prisma.sql`plainto_tsquery('english', ${query.keyword})`;
    conditions.push(Prisma.sql`${tsVector} @@ ${tsQuery}`);

    const whereClause = Prisma.join(conditions, " AND ");

    const [rows, countRows] = await Promise.all([
      this.prismaClient.$queryRaw<Array<BrandSearchRow & { rank: number }>>`
        SELECT id, name, slug, description, ts_rank(${tsVector}, ${tsQuery}) AS rank
        FROM brands
        WHERE ${whereClause}
        ORDER BY rank DESC
        LIMIT ${take} OFFSET ${skip}
      `,
      this.prismaClient.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count FROM brands WHERE ${whereClause}
      `,
    ]);

    const imageMap = await loadImageUrls(
      this.prismaClient,
      rows.map((row) => ({ entityType: SEARCH_ENTITY_TYPES.BRAND, id: row.id })),
    );
    const items = rows.map((row) =>
      toResultItem(
        SEARCH_ENTITY_TYPES.BRAND,
        row,
        row.rank,
        imageMap.get(imageKey(SEARCH_ENTITY_TYPES.BRAND, row.id)) ?? null,
      ),
    );
    return { items, total: Number(countRows[0]?.count ?? 0) };
  }

  private async buildSuggestions(
    query: AutocompleteQuery,
    fullText: boolean,
  ): Promise<SearchSuggestion[]> {
    const perEntityLimit = Math.max(1, Math.ceil(query.limit / query.entityTypes.length));
    const results = await Promise.all(
      query.entityTypes.map((entityType) =>
        this.suggestEntity(entityType, query, perEntityLimit, fullText),
      ),
    );
    return results.flat().slice(0, query.limit);
  }

  private async suggestEntity(
    entityType: SearchEntityType,
    query: AutocompleteQuery,
    limit: number,
    fullText: boolean,
  ): Promise<SearchSuggestion[]> {
    switch (entityType) {
      case SEARCH_ENTITY_TYPES.PRODUCT:
        return fullText
          ? this.suggestProductsFullText(query, limit)
          : this.suggestProductsPattern(query, limit);
      case SEARCH_ENTITY_TYPES.CATEGORY:
        return fullText
          ? this.suggestCategoriesFullText(query, limit)
          : this.suggestCategoriesPattern(query, limit);
      case SEARCH_ENTITY_TYPES.BRAND:
        return fullText
          ? this.suggestBrandsFullText(query, limit)
          : this.suggestBrandsPattern(query, limit);
      default: {
        const exhaustiveCheck: never = entityType;
        throw new InternalServerError(`Unsupported search entity type: ${String(exhaustiveCheck)}`);
      }
    }
  }

  private async suggestProductsPattern(
    query: AutocompleteQuery,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.PRODUCT);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(scope ? { status: scope.status, visibility: scope.visibility } : {}),
      name: { contains: query.keyword, mode: "insensitive" },
    };
    const [rows, matchCount] = await Promise.all([
      this.prismaClient.product.findMany({
        where,
        select: { name: true },
        distinct: ["name"],
        orderBy: { name: "asc" },
        take: limit,
      }),
      this.prismaClient.product.count({ where }),
    ]);
    return rows.map((row) => ({
      text: row.name,
      entityType: SEARCH_ENTITY_TYPES.PRODUCT,
      matchCount,
    }));
  }

  private async suggestCategoriesPattern(
    query: AutocompleteQuery,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.CATEGORY);
    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(scope ? { status: scope.status, visibility: scope.visibility } : {}),
      name: { contains: query.keyword, mode: "insensitive" },
    };
    const [rows, matchCount] = await Promise.all([
      this.prismaClient.category.findMany({
        where,
        select: { name: true },
        distinct: ["name"],
        orderBy: { name: "asc" },
        take: limit,
      }),
      this.prismaClient.category.count({ where }),
    ]);
    return rows.map((row) => ({
      text: row.name,
      entityType: SEARCH_ENTITY_TYPES.CATEGORY,
      matchCount,
    }));
  }

  private async suggestBrandsPattern(
    query: AutocompleteQuery,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.BRAND);
    const where: Prisma.BrandWhereInput = {
      deletedAt: null,
      ...(scope ? { status: scope.status, visibility: scope.visibility } : {}),
      name: { contains: query.keyword, mode: "insensitive" },
    };
    const [rows, matchCount] = await Promise.all([
      this.prismaClient.brand.findMany({
        where,
        select: { name: true },
        distinct: ["name"],
        orderBy: { name: "asc" },
        take: limit,
      }),
      this.prismaClient.brand.count({ where }),
    ]);
    return rows.map((row) => ({
      text: row.name,
      entityType: SEARCH_ENTITY_TYPES.BRAND,
      matchCount,
    }));
  }

  private async suggestProductsFullText(
    query: AutocompleteQuery,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.PRODUCT);
    const conditions: Prisma.Sql[] = [Prisma.sql`deleted_at IS NULL`];
    if (scope) {
      conditions.push(
        Prisma.sql`status = ${scope.status}`,
        Prisma.sql`visibility = ${scope.visibility}`,
      );
    }
    const tsVector = Prisma.sql`to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(sku,''))`;
    const tsQuery = Prisma.sql`plainto_tsquery('english', ${query.keyword})`;
    conditions.push(Prisma.sql`${tsVector} @@ ${tsQuery}`);
    const whereClause = Prisma.join(conditions, " AND ");

    const [rows, countRows] = await Promise.all([
      this.prismaClient.$queryRaw<Array<{ name: string }>>`
        SELECT DISTINCT ON (name) name
        FROM products
        WHERE ${whereClause}
        ORDER BY name, ts_rank(${tsVector}, ${tsQuery}) DESC
        LIMIT ${limit}
      `,
      this.prismaClient.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count FROM products WHERE ${whereClause}
      `,
    ]);
    const matchCount = Number(countRows[0]?.count ?? 0);
    return rows.map((row) => ({
      text: row.name,
      entityType: SEARCH_ENTITY_TYPES.PRODUCT,
      matchCount,
    }));
  }

  private async suggestCategoriesFullText(
    query: AutocompleteQuery,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.CATEGORY);
    const conditions: Prisma.Sql[] = [Prisma.sql`deleted_at IS NULL`];
    if (scope) {
      conditions.push(
        Prisma.sql`status = ${scope.status}`,
        Prisma.sql`visibility = ${scope.visibility}`,
      );
    }
    const tsVector = Prisma.sql`to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,''))`;
    const tsQuery = Prisma.sql`plainto_tsquery('english', ${query.keyword})`;
    conditions.push(Prisma.sql`${tsVector} @@ ${tsQuery}`);
    const whereClause = Prisma.join(conditions, " AND ");

    const [rows, countRows] = await Promise.all([
      this.prismaClient.$queryRaw<Array<{ name: string }>>`
        SELECT DISTINCT ON (name) name
        FROM categories
        WHERE ${whereClause}
        ORDER BY name, ts_rank(${tsVector}, ${tsQuery}) DESC
        LIMIT ${limit}
      `,
      this.prismaClient.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count FROM categories WHERE ${whereClause}
      `,
    ]);
    const matchCount = Number(countRows[0]?.count ?? 0);
    return rows.map((row) => ({
      text: row.name,
      entityType: SEARCH_ENTITY_TYPES.CATEGORY,
      matchCount,
    }));
  }

  private async suggestBrandsFullText(
    query: AutocompleteQuery,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const scope = resolveEntityVisibility(query.visibilityScope, SEARCH_ENTITY_TYPES.BRAND);
    const conditions: Prisma.Sql[] = [Prisma.sql`deleted_at IS NULL`];
    if (scope) {
      conditions.push(
        Prisma.sql`status = ${scope.status}`,
        Prisma.sql`visibility = ${scope.visibility}`,
      );
    }
    const tsVector = Prisma.sql`to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,''))`;
    const tsQuery = Prisma.sql`plainto_tsquery('english', ${query.keyword})`;
    conditions.push(Prisma.sql`${tsVector} @@ ${tsQuery}`);
    const whereClause = Prisma.join(conditions, " AND ");

    const [rows, countRows] = await Promise.all([
      this.prismaClient.$queryRaw<Array<{ name: string }>>`
        SELECT DISTINCT ON (name) name
        FROM brands
        WHERE ${whereClause}
        ORDER BY name, ts_rank(${tsVector}, ${tsQuery}) DESC
        LIMIT ${limit}
      `,
      this.prismaClient.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count FROM brands WHERE ${whereClause}
      `,
    ]);
    const matchCount = Number(countRows[0]?.count ?? 0);
    return rows.map((row) => ({
      text: row.name,
      entityType: SEARCH_ENTITY_TYPES.BRAND,
      matchCount,
    }));
  }

  /** The `quantity - reservedQuantity` available-stock computation is
   * never stored (see `prisma/schema.prisma`'s doc comment on
   * `InventoryItem`), so "which SKUs are in stock" is recomputed here
   * from `inventory_items`, summed across every warehouse. Shared by
   * both `buildStockCondition` (pattern mode, returns a Prisma `where`
   * fragment) and the full-text queries above (which build their own
   * raw SQL `IN`/`NOT IN` fragment from the same SKU list). */
  private async getInStockSkus(): Promise<string[]> {
    const rows = await this.prismaClient.$queryRaw<Array<{ sku: string }>>`
      SELECT sku FROM inventory_items GROUP BY sku HAVING SUM(quantity) - SUM(reserved_quantity) > 0
    `;
    return rows.map((row) => row.sku);
  }

  private async buildStockCondition(
    inStock: boolean | undefined,
  ): Promise<Prisma.ProductWhereInput | null> {
    if (inStock === undefined) return null;
    const skus = await this.getInStockSkus();
    if (skus.length === 0) {
      return inStock ? { id: { in: [] } } : {};
    }
    return inStock ? { sku: { in: skus } } : { sku: { notIn: skus } };
  }

  private async buildRawStockCondition(inStock: boolean): Promise<Prisma.Sql> {
    const skus = await this.getInStockSkus();
    if (skus.length === 0) {
      return inStock ? Prisma.sql`1 = 0` : Prisma.sql`1 = 1`;
    }
    return inStock
      ? Prisma.sql`sku IN (${Prisma.join(skus)})`
      : Prisma.sql`sku NOT IN (${Prisma.join(skus)})`;
  }
}
