import { hashPassword, verifyPassword } from "../../../auth";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CreateUserDto, UpdateUserDto } from "../dto";
import type { UserRepository } from "../repository";
import type { User } from "../types";

/**
 * Skeleton user service — the operations a concrete implementation will
 * expose once user persistence exists. Depends on `UserRepository`
 * (interface only; see `repository/`), never on Prisma directly, so this
 * class never changes when the persistence layer does.
 *
 * `hashPassword`/`verifyPassword` are the one piece of real,
 * already-built logic wired in here: turning a submitted plaintext
 * password into (or checking it against) a hash is pure, stateless
 * `auth/` infrastructure, not a database operation or business rule, so
 * there is nothing to leave as a stub. Every other method below throws
 * `NotImplementedError` — no database operations happen in this
 * foundation.
 */
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async hashPassword(plainPassword: string): Promise<string> {
    return hashPassword(plainPassword);
  }

  async verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
    return verifyPassword(plainPassword, passwordHash);
  }

  async findById(id: string): Promise<User | null> {
    throw new NotImplementedError(`UserService.findById is not implemented yet (id: ${id})`);
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new NotImplementedError(
      `UserService.findByEmail is not implemented yet (email: ${email})`,
    );
  }

  async findAll(_query: ParsedQuery): Promise<PaginatedResult<User>> {
    throw new NotImplementedError("UserService.findAll is not implemented yet");
  }

  async create(_dto: CreateUserDto): Promise<User> {
    throw new NotImplementedError("UserService.create is not implemented yet");
  }

  async update(id: string, _dto: UpdateUserDto): Promise<User> {
    throw new NotImplementedError(`UserService.update is not implemented yet (id: ${id})`);
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(`UserService.delete is not implemented yet (id: ${id})`);
  }
}
