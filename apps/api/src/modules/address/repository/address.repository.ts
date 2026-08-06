import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { DefaultAddressContext } from "../constants";
import type { AddressFilterOptions } from "../interfaces";
import type { Address, CreateAddressInput, UpdateAddressInput } from "../types";

export interface AddressLookupOptions {
  /** `false` (the default) excludes soft-deleted rows — every lookup
   * except the one `AddressService.restore` uses to find an
   * already-deleted address by id. */
  includeDeleted?: boolean;
}

/**
 * Persistence contract for the Address domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `AddressPrismaRepository` for a test double (or
 * a different persistence layer entirely) never touches service code.
 *
 * `setDefaultForUser` exists as its own method rather than something
 * `update` does implicitly: it must clear the user's *previous* default
 * for `context` (if any) and set the *new* one atomically, in one
 * transaction — see `AddressPrismaRepository.setDefaultForUser`'s doc
 * comment. `softDelete`/`restore` are named after `modules/product`'s
 * identical pair rather than a single generic `delete`, since this
 * module never hard-deletes a row through its own API.
 */
export interface AddressRepository {
  findById(id: string, options?: AddressLookupOptions): Promise<Address | null>;
  findByUserId(
    userId: string,
    query: ParsedQuery,
    filters?: AddressFilterOptions,
  ): Promise<PaginatedResult<Address>>;
  findDefaultByUserId(userId: string, context: DefaultAddressContext): Promise<Address | null>;
  create(data: CreateAddressInput): Promise<Address>;
  update(id: string, data: UpdateAddressInput): Promise<Address>;
  /** Soft-deletes `id` (sets `deletedAt`) and clears both default flags
   * in the same write — a deleted address is never left as anyone's
   * default. */
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  /** Atomically unsets whichever of the user's addresses currently has
   * `context`'s default flag (if any) and sets it on `addressId`,
   * inside one transaction — the write half of
   * `AddressService.setDefaultShipping`/`setDefaultBilling`; the
   * service has already validated `addressId` is owned by `userId` and
   * usable for `context` before calling this. */
  setDefaultForUser(
    userId: string,
    addressId: string,
    context: DefaultAddressContext,
  ): Promise<Address>;
}
