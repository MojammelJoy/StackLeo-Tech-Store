import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { NotFoundError } from "../../../errors";
import { DEFAULT_ADDRESS_CONTEXTS } from "../constants";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { AddressLabel, AddressType, DefaultAddressContext } from "../constants";
import type { AddressFilterOptions } from "../interfaces";
import type { Address, CreateAddressInput, UpdateAddressInput } from "../types";
import type { AddressLookupOptions, AddressRepository } from "./address.repository";
import type { Address as PrismaAddress, Prisma, PrismaClient } from "@prisma/client";

/** Prisma's generated model type stores `type`/`label` as plain
 * `string` (they're `String` columns, not native Postgres enums — see
 * `prisma/schema.prisma`'s doc comment on `Address`, which mirrors
 * `Product`/`Cart`/`Wishlist`). This is the one place that narrows them
 * back to this module's literal unions: every row only ever got there
 * through a Zod-validated DTO, so the cast is safe. */
function toDomainAddress(row: PrismaAddress): Address {
  return { ...row, type: row.type as AddressType, label: row.label as AddressLabel };
}

function toDomainAddressList(rows: PrismaAddress[]): Address[] {
  return rows.map(toDomainAddress);
}

function defaultFlagField(
  context: DefaultAddressContext,
): "isDefaultShipping" | "isDefaultBilling" {
  return context === DEFAULT_ADDRESS_CONTEXTS.SHIPPING ? "isDefaultShipping" : "isDefaultBilling";
}

/**
 * Prisma-backed implementation of `AddressRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class AddressPrismaRepository implements AddressRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string, options: AddressLookupOptions = {}): Promise<Address | null> {
    const row = await this.prismaClient.address.findUnique({ where: { id } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainAddress(row);
  }

  async findByUserId(
    userId: string,
    query: ParsedQuery,
    filters: AddressFilterOptions = {},
  ): Promise<PaginatedResult<Address>> {
    const where = buildWhere(userId, filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.address.findMany({ where, orderBy, skip, take }),
      this.prismaClient.address.count({ where }),
    ]);

    return {
      items: toDomainAddressList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async findDefaultByUserId(
    userId: string,
    context: DefaultAddressContext,
  ): Promise<Address | null> {
    const row = await this.prismaClient.address.findFirst({
      where: { userId, deletedAt: null, [defaultFlagField(context)]: true },
    });
    return row ? toDomainAddress(row) : null;
  }

  async create(data: CreateAddressInput): Promise<Address> {
    const row = await this.prismaClient.address.create({
      data: {
        userId: data.userId,
        type: data.type,
        label: data.label,
        recipientName: data.recipientName,
        phone: data.phone ?? null,
        line1: data.line1,
        line2: data.line2 ?? null,
        city: data.city,
        district: data.district ?? null,
        division: data.division,
        postalCode: data.postalCode,
        country: data.country,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      },
    });
    return toDomainAddress(row);
  }

  async update(id: string, data: UpdateAddressInput): Promise<Address> {
    const row = await this.prismaClient.address.update({
      where: { id },
      data: {
        type: data.type,
        label: data.label,
        recipientName: data.recipientName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        district: data.district,
        division: data.division,
        postalCode: data.postalCode,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
    return toDomainAddress(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.prismaClient.address.update({
      where: { id },
      data: { deletedAt: new Date(), isDefaultShipping: false, isDefaultBilling: false },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prismaClient.address.update({ where: { id }, data: { deletedAt: null } });
  }

  /** Runs the unset-previous-default + set-new-default pair inside one
   * `$transaction`, so a request that fails partway through never
   * leaves two addresses (or zero) marked default for the same context
   * — the actual enforcement of "only one default per context per
   * user" (see `prisma/schema.prisma`'s `Address` doc comment on why
   * this isn't a database constraint instead). `updateMany` rather than
   * a targeted single-row update for the "unset" half: it's a no-op
   * when there was no previous default, and still exactly one row when
   * there was, without the repository needing to look it up first. */
  async setDefaultForUser(
    userId: string,
    addressId: string,
    context: DefaultAddressContext,
  ): Promise<Address> {
    const field = defaultFlagField(context);

    const updated = await this.prismaClient.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, deletedAt: null, [field]: true },
        data: { [field]: false },
      });
      return tx.address.update({ where: { id: addressId }, data: { [field]: true } });
    });

    if (!updated) {
      throw new NotFoundError("Address not found");
    }
    return toDomainAddress(updated);
  }
}

function buildWhere(
  userId: string,
  filters: AddressFilterOptions,
  search?: string,
): Prisma.AddressWhereInput {
  const conditions: Prisma.AddressWhereInput[] = [{ userId }];

  if (!filters.includeDeleted) {
    conditions.push({ deletedAt: null });
  }
  if (filters.type) {
    conditions.push({ type: filters.type });
  }
  if (filters.label) {
    conditions.push({ label: filters.label });
  }
  if (filters.country) {
    conditions.push({ country: filters.country });
  }
  if (filters.isDefaultShipping !== undefined) {
    conditions.push({ isDefaultShipping: filters.isDefaultShipping });
  }
  if (filters.isDefaultBilling !== undefined) {
    conditions.push({ isDefaultBilling: filters.isDefaultBilling });
  }

  if (search) {
    conditions.push({
      OR: [
        { recipientName: { contains: search, mode: "insensitive" } },
        { line1: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { postalCode: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return { AND: conditions };
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository. */
function buildOrderBy(sort: SortParam[]): Prisma.AddressOrderByWithRelationInput[] {
  if (sort.length === 0) return [{ createdAt: "desc" }, { id: "asc" }];
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
