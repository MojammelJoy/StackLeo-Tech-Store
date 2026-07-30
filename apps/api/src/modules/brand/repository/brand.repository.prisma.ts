import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { BrandFilterOptions } from "../interfaces";
import type { Brand, CreateBrandInput, UpdateBrandInput } from "../types";
import type { BrandRepository } from "./brand.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `BrandRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Brand` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once a model exists.
 */
export class BrandPrismaRepository implements BrandRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Brand | null> {
    throw new NotImplementedError(
      `BrandPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    throw new NotImplementedError(
      `BrandPrismaRepository.findBySlug is not implemented yet (slug: ${slug})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: BrandFilterOptions,
  ): Promise<PaginatedResult<Brand>> {
    throw new NotImplementedError("BrandPrismaRepository.findAll is not implemented yet");
  }

  async existsBySlug(slug: string): Promise<boolean> {
    throw new NotImplementedError(
      `BrandPrismaRepository.existsBySlug is not implemented yet (slug: ${slug})`,
    );
  }

  async create(_data: CreateBrandInput): Promise<Brand> {
    throw new NotImplementedError("BrandPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateBrandInput): Promise<Brand> {
    throw new NotImplementedError(
      `BrandPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(
      `BrandPrismaRepository.delete is not implemented yet (id: ${id})`,
    );
  }
}
