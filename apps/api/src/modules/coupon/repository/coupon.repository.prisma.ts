import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CouponFilterOptions } from "../interfaces";
import type { CreateCouponInput, Coupon, UpdateCouponInput } from "../types";
import type { CouponRepository } from "./coupon.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `CouponRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Coupon` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once a model exists.
 */
export class CouponPrismaRepository implements CouponRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Coupon | null> {
    throw new NotImplementedError(
      `CouponPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByCode(code: string): Promise<Coupon | null> {
    throw new NotImplementedError(
      `CouponPrismaRepository.findByCode is not implemented yet (code: ${code})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: CouponFilterOptions,
  ): Promise<PaginatedResult<Coupon>> {
    throw new NotImplementedError("CouponPrismaRepository.findAll is not implemented yet");
  }

  async create(_data: CreateCouponInput): Promise<Coupon> {
    throw new NotImplementedError("CouponPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateCouponInput): Promise<Coupon> {
    throw new NotImplementedError(
      `CouponPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async incrementUsageCount(id: string): Promise<Coupon> {
    throw new NotImplementedError(
      `CouponPrismaRepository.incrementUsageCount is not implemented yet (id: ${id})`,
    );
  }

  async countUserRedemptions(couponId: string, userId: string): Promise<number> {
    throw new NotImplementedError(
      `CouponPrismaRepository.countUserRedemptions is not implemented yet (couponId: ${couponId}, userId: ${userId})`,
    );
  }
}
