import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { NotificationStatus } from "../constants";
import type { NotificationFilterOptions } from "../interfaces";
import type { CreateNotificationInput, Notification, UpdateNotificationInput } from "../types";
import type { NotificationRepository } from "./notification.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `NotificationRepository` — currently
 * a skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Notification` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once a model exists.
 */
export class NotificationPrismaRepository implements NotificationRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Notification | null> {
    throw new NotImplementedError(
      `NotificationPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByUserId(
    userId: string,
    _query: ParsedQuery,
    _filters?: NotificationFilterOptions,
  ): Promise<PaginatedResult<Notification>> {
    throw new NotImplementedError(
      `NotificationPrismaRepository.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findDueForDelivery(now: Date): Promise<Notification[]> {
    throw new NotImplementedError(
      `NotificationPrismaRepository.findDueForDelivery is not implemented yet (now: ${now.toISOString()})`,
    );
  }

  async create(_data: CreateNotificationInput): Promise<Notification> {
    throw new NotImplementedError("NotificationPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateNotificationInput): Promise<Notification> {
    throw new NotImplementedError(
      `NotificationPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async updateStatus(id: string, status: NotificationStatus): Promise<Notification> {
    throw new NotImplementedError(
      `NotificationPrismaRepository.updateStatus is not implemented yet (id: ${id}, status: ${status})`,
    );
  }
}
