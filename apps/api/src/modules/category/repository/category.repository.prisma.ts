import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CategoryFilterOptions } from "../interfaces";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types";
import type { CategoryRepository } from "./category.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `CategoryRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Category` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once a model exists.
 */
export class CategoryPrismaRepository implements CategoryRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Category | null> {
    throw new NotImplementedError(
      `CategoryPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findBySlug(slug: string): Promise<Category | null> {
    throw new NotImplementedError(
      `CategoryPrismaRepository.findBySlug is not implemented yet (slug: ${slug})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: CategoryFilterOptions,
  ): Promise<PaginatedResult<Category>> {
    throw new NotImplementedError("CategoryPrismaRepository.findAll is not implemented yet");
  }

  async findChildren(parentId: string | null): Promise<Category[]> {
    throw new NotImplementedError(
      `CategoryPrismaRepository.findChildren is not implemented yet (parentId: ${parentId})`,
    );
  }

  async existsBySlug(slug: string): Promise<boolean> {
    throw new NotImplementedError(
      `CategoryPrismaRepository.existsBySlug is not implemented yet (slug: ${slug})`,
    );
  }

  async create(_data: CreateCategoryInput): Promise<Category> {
    throw new NotImplementedError("CategoryPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateCategoryInput): Promise<Category> {
    throw new NotImplementedError(
      `CategoryPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(
      `CategoryPrismaRepository.delete is not implemented yet (id: ${id})`,
    );
  }
}
