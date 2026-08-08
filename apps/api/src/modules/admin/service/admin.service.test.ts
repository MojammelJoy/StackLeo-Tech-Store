import { describe, expect, it, vi } from "vitest";

import { AdminService } from "./admin.service";

import type { AuthenticatedUser } from "../../../auth";
import type { AdminRepository } from "../repository";
import type { SystemSetting } from "../types";

function buildSetting(overrides: Partial<SystemSetting> = {}): SystemSetting {
  return {
    key: "site.maintenance_mode",
    value: "false",
    description: "Whether the storefront is in maintenance mode.",
    updatedBy: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildRepository(overrides: Partial<AdminRepository> = {}): AdminRepository {
  return {
    findSystemSettingByKey: vi.fn().mockResolvedValue(null),
    findAllSystemSettings: vi.fn().mockResolvedValue({ items: [], meta: {} }),
    createSystemSetting: vi.fn(),
    updateSystemSetting: vi.fn(),
    deleteSystemSetting: vi.fn(),
    getDashboardSummary: vi.fn(),
    getPermissionMappings: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

const ADMIN: AuthenticatedUser = { id: "admin-1", roles: ["admin"] } as AuthenticatedUser;

describe("AdminService", () => {
  describe("getSystemSetting", () => {
    it("throws when the setting does not exist", async () => {
      const service = new AdminService(buildRepository());
      await expect(service.getSystemSetting("missing.key")).rejects.toThrow(/not found/i);
    });
  });

  describe("createSystemSetting", () => {
    it("rejects creating a setting whose key already exists", async () => {
      const repository = buildRepository({
        findSystemSettingByKey: vi.fn().mockResolvedValue(buildSetting()),
      });
      const service = new AdminService(repository);

      await expect(
        service.createSystemSetting(
          { key: "site.maintenance_mode", value: "true" } as never,
          ADMIN,
        ),
      ).rejects.toThrow(/already exists/i);
      expect(repository.createSystemSetting).not.toHaveBeenCalled();
    });

    it("stamps updatedBy from the real actor, never a client value", async () => {
      const createSystemSetting = vi.fn().mockResolvedValue(buildSetting({ updatedBy: "admin-1" }));
      const repository = buildRepository({ createSystemSetting });
      const service = new AdminService(repository);

      await service.createSystemSetting(
        { key: "site.maintenance_mode", value: "true" } as never,
        ADMIN,
      );
      expect(createSystemSetting).toHaveBeenCalledWith(
        expect.objectContaining({ updatedBy: "admin-1" }),
      );
    });
  });

  describe("updateSystemSetting", () => {
    it("throws when the setting does not exist", async () => {
      const service = new AdminService(buildRepository());
      await expect(
        service.updateSystemSetting("missing.key", { value: "true" } as never, ADMIN),
      ).rejects.toThrow(/not found/i);
    });

    it("stamps updatedBy from the real actor on update too", async () => {
      const updateSystemSetting = vi.fn().mockResolvedValue(buildSetting({ updatedBy: "admin-1" }));
      const repository = buildRepository({
        findSystemSettingByKey: vi.fn().mockResolvedValue(buildSetting()),
        updateSystemSetting,
      });
      const service = new AdminService(repository);

      await service.updateSystemSetting("site.maintenance_mode", { value: "true" } as never, ADMIN);
      expect(updateSystemSetting).toHaveBeenCalledWith(
        "site.maintenance_mode",
        expect.objectContaining({ value: "true", updatedBy: "admin-1" }),
      );
    });
  });

  describe("deleteSystemSetting", () => {
    it("throws when the setting does not exist", async () => {
      const service = new AdminService(buildRepository());
      await expect(service.deleteSystemSetting("missing.key", ADMIN)).rejects.toThrow(/not found/i);
    });

    it("deletes an existing setting", async () => {
      const deleteSystemSetting = vi.fn().mockResolvedValue(undefined);
      const repository = buildRepository({
        findSystemSettingByKey: vi.fn().mockResolvedValue(buildSetting()),
        deleteSystemSetting,
      });
      const service = new AdminService(repository);

      await service.deleteSystemSetting("site.maintenance_mode", ADMIN);
      expect(deleteSystemSetting).toHaveBeenCalledWith("site.maintenance_mode");
    });
  });

  describe("getDashboardSummary / getPermissionMappings", () => {
    it("returns the repository's dashboard summary unchanged", async () => {
      const summary = { generatedAt: new Date("2026-01-01"), metrics: [] };
      const repository = buildRepository({
        getDashboardSummary: vi.fn().mockResolvedValue(summary),
      });
      const service = new AdminService(repository);

      const result = await service.getDashboardSummary();
      expect(result).toEqual(summary);
    });

    it("returns the repository's permission mappings unchanged", async () => {
      const mappings = [{ module: "user", actions: { view: "user:view" } }];
      const repository = buildRepository({
        getPermissionMappings: vi.fn().mockResolvedValue(mappings),
      });
      const service = new AdminService(repository);

      const result = await service.getPermissionMappings();
      expect(result).toEqual(mappings);
    });
  });
});
