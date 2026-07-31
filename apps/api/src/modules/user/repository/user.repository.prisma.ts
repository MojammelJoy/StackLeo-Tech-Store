import { prisma } from "../../../database";

import type { FilterParams, PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { CreateUserInput, UpdateUserInput, User } from "../types";
import type { UserRepository } from "./user.repository";
import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `UserRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), so a caller only ever needs to swap the constructor
 * argument to point at a different client (e.g. a per-test instance).
 */
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({ where: { email: normalizeEmail(email) } });
  }

  async findAll(query: ParsedQuery): Promise<PaginatedResult<User>> {
    const where = buildWhere(query.filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const skip = (pagination.page - 1) * pagination.limit;

    const [items, totalItems] = await Promise.all([
      this.prismaClient.user.findMany({ where, orderBy, skip, take: pagination.limit }),
      this.prismaClient.user.count({ where }),
    ]);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pagination.limit);

    return {
      items,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prismaClient.user.count({
      where: { email: normalizeEmail(email) },
    });
    return count > 0;
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.prismaClient.user.create({
      data: {
        email: normalizeEmail(data.email),
        passwordHash: data.passwordHash,
        roles: data.roles,
      },
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return this.prismaClient.user.update({
      where: { id },
      data: {
        email: data.email !== undefined ? normalizeEmail(data.email) : undefined,
        passwordHash: data.passwordHash,
        roles: data.roles,
        isActive: data.isActive,
        isEmailVerified: data.isEmailVerified,
        emailVerifiedAt: data.emailVerifiedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaClient.user.delete({ where: { id } });
  }
}

/** Email addresses are matched case-insensitively at the application
 * layer by always lower-casing before every read/write — cheaper and
 * more portable than a Postgres citext column, and enough given nothing
 * else in this schema needs case-insensitive text search. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildWhere(filters: FilterParams, search?: string): Prisma.UserWhereInput {
  const conditions: Prisma.UserWhereInput[] = [];

  for (const [field, condition] of Object.entries(filters)) {
    if (field === "email") {
      conditions.push({ email: buildStringFilter(condition.operator, condition.value) });
    } else if (field === "isActive") {
      conditions.push({ isActive: Boolean(condition.value) });
    }
  }

  if (search) {
    conditions.push({ email: { contains: search, mode: "insensitive" } });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

function buildStringFilter(operator: string, value: unknown): Prisma.StringFilter<"User"> | string {
  switch (operator) {
    case "ne":
      return { not: String(value) };
    case "contains":
      return { contains: String(value), mode: "insensitive" };
    case "in":
      return { in: (Array.isArray(value) ? value : [value]).map(String) };
    case "eq":
    default:
      return String(value);
  }
}

function buildOrderBy(sort: SortParam[]): Prisma.UserOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ createdAt: "desc" }];
  }

  return sort.map(({ field, order }) => ({ [field]: order }));
}
