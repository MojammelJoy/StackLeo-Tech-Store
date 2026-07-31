/**
 * The persisted User domain entity — matches the `User` model in
 * `prisma/schema.prisma`. `isEmailVerified`/`emailVerifiedAt` are set by
 * `modules/auth`'s email-verification flow, not by anything in this
 * module.
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  roles: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository-level creation input. Deliberately carries `passwordHash`,
 * never a plaintext password — turning one into the other is the
 * service layer's job (via `auth/hashPassword`), never the
 * repository's.
 */
export interface CreateUserInput {
  email: string;
  passwordHash: string;
  roles?: string[];
}

export interface UpdateUserInput {
  email?: string;
  passwordHash?: string;
  roles?: string[];
  isActive?: boolean;
  isEmailVerified?: boolean;
  emailVerifiedAt?: Date | null;
}
