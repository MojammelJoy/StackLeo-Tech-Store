import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { ProductFilterOptions } from "../interfaces";
import type { CreateProductInput, Product, UpdateProductInput } from "../types";
import type { ProductRepository } from "./product.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `ProductRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Product` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once a model exists.
 */
export class ProductPrismaRepository implements ProductRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Product | null> {
    throw new NotImplementedError(
      `ProductPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findBySku(sku: string): Promise<Product | null> {
    throw new NotImplementedError(
      `ProductPrismaRepository.findBySku is not implemented yet (sku: ${sku})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: ProductFilterOptions,
  ): Promise<PaginatedResult<Product>> {
    throw new NotImplementedError("ProductPrismaRepository.findAll is not implemented yet");
  }

  async existsBySku(sku: string): Promise<boolean> {
    throw new NotImplementedError(
      `ProductPrismaRepository.existsBySku is not implemented yet (sku: ${sku})`,
    );
  }

  async create(_data: CreateProductInput): Promise<Product> {
    throw new NotImplementedError("ProductPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateProductInput): Promise<Product> {
    throw new NotImplementedError(
      `ProductPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(
      `ProductPrismaRepository.delete is not implemented yet (id: ${id})`,
    );
  }
}
