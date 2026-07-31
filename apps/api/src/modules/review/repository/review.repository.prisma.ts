import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { ModerationStatus } from "../constants";
import type { ReviewFilterOptions } from "../interfaces";
import type { CreateReviewInput, Review, ReviewSummary, UpdateReviewInput } from "../types";
import type { ReviewRepository } from "./review.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `ReviewRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Review` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once a model exists.
 */
export class ReviewPrismaRepository implements ReviewRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Review | null> {
    throw new NotImplementedError(
      `ReviewPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByProductId(
    productId: string,
    _query: ParsedQuery,
    _filters?: ReviewFilterOptions,
  ): Promise<PaginatedResult<Review>> {
    throw new NotImplementedError(
      `ReviewPrismaRepository.findByProductId is not implemented yet (productId: ${productId})`,
    );
  }

  async findByUserId(userId: string, _query: ParsedQuery): Promise<PaginatedResult<Review>> {
    throw new NotImplementedError(
      `ReviewPrismaRepository.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
    throw new NotImplementedError(
      `ReviewPrismaRepository.findByUserAndProduct is not implemented yet (userId: ${userId}, productId: ${productId})`,
    );
  }

  async create(_data: CreateReviewInput): Promise<Review> {
    throw new NotImplementedError("ReviewPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateReviewInput): Promise<Review> {
    throw new NotImplementedError(
      `ReviewPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async updateModerationStatus(id: string, status: ModerationStatus): Promise<Review> {
    throw new NotImplementedError(
      `ReviewPrismaRepository.updateModerationStatus is not implemented yet (id: ${id}, status: ${status})`,
    );
  }

  async incrementVote(id: string, helpful: boolean): Promise<Review> {
    throw new NotImplementedError(
      `ReviewPrismaRepository.incrementVote is not implemented yet (id: ${id}, helpful: ${String(helpful)})`,
    );
  }

  async getSummaryByProductId(productId: string): Promise<ReviewSummary> {
    throw new NotImplementedError(
      `ReviewPrismaRepository.getSummaryByProductId is not implemented yet (productId: ${productId})`,
    );
  }
}
