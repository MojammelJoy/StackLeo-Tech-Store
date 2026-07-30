/**
 * The persisted User domain entity. Not a Prisma-generated type — no
 * `User` model exists in `prisma/schema.prisma` yet (out of scope for
 * this foundation). This is the shape the repository interface and
 * service operate on today, and what a future Prisma model is expected
 * to match once it exists.
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  roles: string[];
  isActive: boolean;
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
}
