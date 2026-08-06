import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser } from "../../../testing";
import { ADDRESS_TYPES } from "../constants";

import { AddressService } from "./address.service";

import type { AuthenticatedUser } from "../../../auth";
import type { AddressRepository } from "../repository";
import type { Address } from "../types";

function buildAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: "address-1",
    userId: "user-1",
    type: ADDRESS_TYPES.BOTH,
    label: "home",
    isDefaultShipping: false,
    isDefaultBilling: false,
    recipientName: "Jane Doe",
    phone: null,
    line1: "123 Main St",
    line2: null,
    city: "Dhaka",
    district: null,
    division: "Dhaka Division",
    postalCode: "1207",
    country: "BD",
    latitude: null,
    longitude: null,
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildAddressRepository(overrides: Partial<AddressRepository> = {}): AddressRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByUserId: vi.fn(),
    findDefaultByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    setDefaultForUser: vi.fn(),
    ...overrides,
  };
}

const ACTOR: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-1" });

describe("AddressService", () => {
  describe("ownership", () => {
    it("reports a foreign address as not found", async () => {
      const repository = buildAddressRepository({
        findById: vi.fn().mockResolvedValue(buildAddress({ userId: "someone-else" })),
      });
      const service = new AddressService(repository);

      await expect(service.getById("address-1", ACTOR)).rejects.toThrow(/not found/i);
    });

    it("returns an owned address", async () => {
      const address = buildAddress();
      const repository = buildAddressRepository({ findById: vi.fn().mockResolvedValue(address) });
      const service = new AddressService(repository);

      const result = await service.getById("address-1", ACTOR);

      expect(result.id).toBe("address-1");
    });
  });

  describe("delete/restore", () => {
    it("soft-deletes an owned address", async () => {
      const address = buildAddress();
      const repository = buildAddressRepository({ findById: vi.fn().mockResolvedValue(address) });
      const service = new AddressService(repository);

      await service.delete("address-1", ACTOR);

      expect(repository.softDelete).toHaveBeenCalledWith("address-1");
    });

    it("blocks deleting a foreign address", async () => {
      const repository = buildAddressRepository({
        findById: vi.fn().mockResolvedValue(buildAddress({ userId: "someone-else" })),
      });
      const service = new AddressService(repository);

      await expect(service.delete("address-1", ACTOR)).rejects.toThrow(/not found/i);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });

    it("rejects restoring an address that isn't deleted", async () => {
      const address = buildAddress({ deletedAt: null });
      const repository = buildAddressRepository({ findById: vi.fn().mockResolvedValue(address) });
      const service = new AddressService(repository);

      await expect(service.restore("address-1", ACTOR)).rejects.toThrow(/not deleted/i);
      expect(repository.restore).not.toHaveBeenCalled();
    });

    it("restores a deleted, owned address", async () => {
      const deleted = buildAddress({ deletedAt: new Date("2026-01-02") });
      const restored = buildAddress({ deletedAt: null });
      const repository = buildAddressRepository({
        findById: vi.fn().mockResolvedValueOnce(deleted).mockResolvedValueOnce(restored),
      });
      const service = new AddressService(repository);

      await service.restore("address-1", ACTOR);

      expect(repository.restore).toHaveBeenCalledWith("address-1");
    });
  });

  describe("setDefaultShipping / setDefaultBilling", () => {
    it("sets a shipping-typed address as the default shipping address", async () => {
      const address = buildAddress({ type: ADDRESS_TYPES.SHIPPING });
      const repository = buildAddressRepository({
        findById: vi.fn().mockResolvedValue(address),
        setDefaultForUser: vi.fn().mockResolvedValue({ ...address, isDefaultShipping: true }),
      });
      const service = new AddressService(repository);

      await service.setDefaultShipping("address-1", ACTOR);

      expect(repository.setDefaultForUser).toHaveBeenCalledWith("user-1", "address-1", "shipping");
    });

    it("rejects setting a billing-only address as the default shipping address", async () => {
      const address = buildAddress({ type: ADDRESS_TYPES.BILLING });
      const repository = buildAddressRepository({ findById: vi.fn().mockResolvedValue(address) });
      const service = new AddressService(repository);

      await expect(service.setDefaultShipping("address-1", ACTOR)).rejects.toThrow(
        /cannot be used as the default shipping/i,
      );
      expect(repository.setDefaultForUser).not.toHaveBeenCalled();
    });

    it("rejects setting a shipping-only address as the default billing address", async () => {
      const address = buildAddress({ type: ADDRESS_TYPES.SHIPPING });
      const repository = buildAddressRepository({ findById: vi.fn().mockResolvedValue(address) });
      const service = new AddressService(repository);

      await expect(service.setDefaultBilling("address-1", ACTOR)).rejects.toThrow(
        /cannot be used as the default billing/i,
      );
      expect(repository.setDefaultForUser).not.toHaveBeenCalled();
    });

    it("allows a 'both'-typed address to become either default independently", async () => {
      const address = buildAddress({ type: ADDRESS_TYPES.BOTH });
      const repository = buildAddressRepository({
        findById: vi.fn().mockResolvedValue(address),
        setDefaultForUser: vi.fn().mockResolvedValue(address),
      });
      const service = new AddressService(repository);

      await service.setDefaultShipping("address-1", ACTOR);
      await service.setDefaultBilling("address-1", ACTOR);

      expect(repository.setDefaultForUser).toHaveBeenNthCalledWith(
        1,
        "user-1",
        "address-1",
        "shipping",
      );
      expect(repository.setDefaultForUser).toHaveBeenNthCalledWith(
        2,
        "user-1",
        "address-1",
        "billing",
      );
    });

    it("blocks setting a default on a foreign address", async () => {
      const repository = buildAddressRepository({
        findById: vi.fn().mockResolvedValue(buildAddress({ userId: "someone-else" })),
      });
      const service = new AddressService(repository);

      await expect(service.setDefaultShipping("address-1", ACTOR)).rejects.toThrow(/not found/i);
      expect(repository.setDefaultForUser).not.toHaveBeenCalled();
    });
  });
});
