import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CreateUserInput, UpdateUserInput, User } from "../types";
import type { UserRepository } from "./user.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `UserRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `User` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once a model exists.
 */
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<User | null> {
    throw new NotImplementedError(
      `UserPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new NotImplementedError(
      `UserPrismaRepository.findByEmail is not implemented yet (email: ${email})`,
    );
  }

  async findAll(_query: ParsedQuery): Promise<PaginatedResult<User>> {
    throw new NotImplementedError("UserPrismaRepository.findAll is not implemented yet");
  }

  async existsByEmail(email: string): Promise<boolean> {
    throw new NotImplementedError(
      `UserPrismaRepository.existsByEmail is not implemented yet (email: ${email})`,
    );
  }

  async create(_data: CreateUserInput): Promise<User> {
    throw new NotImplementedError("UserPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateUserInput): Promise<User> {
    throw new NotImplementedError(`UserPrismaRepository.update is not implemented yet (id: ${id})`);
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(`UserPrismaRepository.delete is not implemented yet (id: ${id})`);
  }
}
