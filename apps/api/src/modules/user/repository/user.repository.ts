import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CreateUserInput, UpdateUserInput, User } from "../types";

/**
 * Persistence contract for the User domain entity. The service depends
 * on this interface, never on a concrete implementation directly, so
 * swapping `UserPrismaRepository` for a test double (or a different
 * persistence layer entirely) never touches service code.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(query: ParsedQuery): Promise<PaginatedResult<User>>;
  existsByEmail(email: string): Promise<boolean>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}
