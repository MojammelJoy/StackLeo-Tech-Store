/**
 * Reusable user infrastructure: domain types, DTOs/validation schemas,
 * the repository contract (plus its currently-skeletal Prisma
 * implementation), and a skeleton service. No controllers, routes, or
 * login/registration business logic live here — this is the plumbing
 * those will depend on once they exist.
 */
export {
  USER_FILTERABLE_FIELDS,
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
  USER_SORTABLE_FIELDS,
} from "./constants";

export type { CreateUserInput, UpdateUserInput, User } from "./types";

export { createUserSchema, toUserResponseDto, updateUserSchema } from "./dto";
export type { CreateUserDto, UpdateUserDto, UserResponseDto } from "./dto";

export type { UserRepository } from "./repository";
export { UserPrismaRepository } from "./repository";

export { UserService } from "./service";
