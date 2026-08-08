import { BadRequestError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { toUserResponseDto } from "../../user";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { UserRepository, UserResponseDto } from "../../user";
import type { UpdateUserRolesDto, UpdateUserStatusDto } from "../dto";

/**
 * Administrative user management — reuses `modules/user`'s own
 * `UserRepository`/`UserPrismaRepository` (already a complete,
 * production-ready implementation: `findAll` with pagination/filter/
 * sort, `findById`, `update`) and `toUserResponseDto` (which already
 * excludes `passwordHash` unconditionally) directly. `modules/user`'s own
 * `UserService` is left untouched — it's an intentionally-unfinished
 * skeleton (see that module's doc comment: "This module deliberately
 * excludes admin user management... "), so this is the first real
 * consumer of `UserRepository` for that purpose, not a modification of
 * anything in `modules/user`.
 *
 * `updateRoles` is kept separate from `setActive` and gated by a
 * stricter permission at the route layer (`rbac:manage`, not
 * `user:update`) — role assignment is a privilege-escalation-sensitive
 * operation, deactivation is not. Both refuse to target the calling
 * admin's own account, so an admin can never lock themselves out or
 * self-escalate through this API (self-service deactivation already
 * exists via `UserProfileService.deactivateAccount`, gated by password
 * confirmation instead).
 */
export class AdminUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async list(query: ParsedQuery): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this.userRepository.findAll(query);
    return { items: result.items.map(toUserResponseDto), meta: result.meta };
  }

  async getById(id: string): Promise<UserResponseDto> {
    const user = await this.getExistingUser(id);
    return toUserResponseDto(user);
  }

  async setActive(
    id: string,
    dto: UpdateUserStatusDto,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    this.assertNotSelf(id, actor, "deactivate or reactivate");
    await this.getExistingUser(id);

    const updated = await this.userRepository.update(id, { isActive: dto.isActive });
    logger.info(
      { userId: id, isActive: dto.isActive, actorId: actor.id },
      "User active status changed by admin",
    );
    return toUserResponseDto(updated);
  }

  async updateRoles(
    id: string,
    dto: UpdateUserRolesDto,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    this.assertNotSelf(id, actor, "change the roles of");
    await this.getExistingUser(id);

    const updated = await this.userRepository.update(id, { roles: dto.roles });
    logger.info({ userId: id, roles: dto.roles, actorId: actor.id }, "User roles changed by admin");
    return toUserResponseDto(updated);
  }

  private async getExistingUser(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  private assertNotSelf(id: string, actor: AuthenticatedUser, action: string): void {
    if (id === actor.id) {
      throw new BadRequestError(`You cannot ${action} your own account through the admin API`);
    }
  }
}
