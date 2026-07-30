import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { MediaOwnerType, MediaPurpose } from "../constants";
import type { MediaFilterOptions } from "../interfaces";
import type { CreateMediaAssetInput, MediaAsset, UpdateMediaAssetInput } from "../types";
import type { MediaRepository } from "./media.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `MediaRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `MediaAsset` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once a model exists.
 */
export class MediaPrismaRepository implements MediaRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<MediaAsset | null> {
    throw new NotImplementedError(
      `MediaPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByOwner(
    ownerType: MediaOwnerType,
    ownerId: string,
    _purpose?: MediaPurpose,
  ): Promise<MediaAsset[]> {
    throw new NotImplementedError(
      `MediaPrismaRepository.findByOwner is not implemented yet (ownerType: ${ownerType}, ownerId: ${ownerId})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: MediaFilterOptions,
  ): Promise<PaginatedResult<MediaAsset>> {
    throw new NotImplementedError("MediaPrismaRepository.findAll is not implemented yet");
  }

  async create(_data: CreateMediaAssetInput): Promise<MediaAsset> {
    throw new NotImplementedError("MediaPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateMediaAssetInput): Promise<MediaAsset> {
    throw new NotImplementedError(
      `MediaPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(
      `MediaPrismaRepository.delete is not implemented yet (id: ${id})`,
    );
  }
}
