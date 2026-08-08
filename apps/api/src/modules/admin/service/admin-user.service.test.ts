import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser } from "../../../testing";

import { AdminUserService } from "./admin-user.service";

import type { AuthenticatedUser } from "../../../auth";
import type { User, UserRepository } from "../../user";

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "shopper@example.com",
    passwordHash: "hashed-secret",
    roles: ["member"],
    isActive: true,
    isEmailVerified: true,
    emailVerifiedAt: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildUserRepository(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn(),
    findAll: vi.fn(),
    existsByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

const ADMIN: AuthenticatedUser = createTestAuthenticatedUser({ id: "admin-1", roles: ["admin"] });

describe("AdminUserService", () => {
  describe("list/getById", () => {
    it("never exposes passwordHash in mapped results", async () => {
      const userRepository = buildUserRepository({
        findAll: vi.fn().mockResolvedValue({ items: [buildUser()], meta: {} }),
      });
      const service = new AdminUserService(userRepository);

      const result = await service.list({ pagination: {}, sort: [], filters: {} } as never);
      expect(result.items[0]).not.toHaveProperty("passwordHash");
      expect(result.items[0].email).toBe("shopper@example.com");
    });

    it("throws when the target user does not exist", async () => {
      const userRepository = buildUserRepository({ findById: vi.fn().mockResolvedValue(null) });
      const service = new AdminUserService(userRepository);

      await expect(service.getById("missing")).rejects.toThrow(/not found/i);
    });
  });

  describe("setActive", () => {
    it("rejects an admin deactivating their own account", async () => {
      const userRepository = buildUserRepository();
      const service = new AdminUserService(userRepository);

      await expect(service.setActive("admin-1", { isActive: false }, ADMIN)).rejects.toThrow(
        /cannot .* your own account/i,
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("deactivates another user's account", async () => {
      const update = vi.fn().mockResolvedValue(buildUser({ isActive: false }));
      const userRepository = buildUserRepository({
        findById: vi.fn().mockResolvedValue(buildUser({ id: "user-2" })),
        update,
      });
      const service = new AdminUserService(userRepository);

      const result = await service.setActive("user-2", { isActive: false }, ADMIN);
      expect(update).toHaveBeenCalledWith("user-2", { isActive: false });
      expect(result.isActive).toBe(false);
    });

    it("throws when the target user does not exist", async () => {
      const userRepository = buildUserRepository({ findById: vi.fn().mockResolvedValue(null) });
      const service = new AdminUserService(userRepository);

      await expect(service.setActive("missing", { isActive: false }, ADMIN)).rejects.toThrow(
        /not found/i,
      );
    });
  });

  describe("updateRoles", () => {
    it("rejects an admin changing their own roles", async () => {
      const userRepository = buildUserRepository();
      const service = new AdminUserService(userRepository);

      await expect(
        service.updateRoles("admin-1", { roles: ["super_admin"] }, ADMIN),
      ).rejects.toThrow(/cannot .* your own account/i);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("updates another user's roles", async () => {
      const update = vi.fn().mockResolvedValue(buildUser({ id: "user-2", roles: ["admin"] }));
      const userRepository = buildUserRepository({
        findById: vi.fn().mockResolvedValue(buildUser({ id: "user-2" })),
        update,
      });
      const service = new AdminUserService(userRepository);

      const result = await service.updateRoles("user-2", { roles: ["admin"] }, ADMIN);
      expect(update).toHaveBeenCalledWith("user-2", { roles: ["admin"] });
      expect(result.roles).toEqual(["admin"]);
    });
  });
});
