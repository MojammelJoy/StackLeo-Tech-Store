import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { AddressType } from "../constants";
import type { AddressFilterOptions } from "../interfaces";
import type { Address, CreateAddressInput, UpdateAddressInput } from "../types";

/**
 * Persistence contract for the Address domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `AddressPrismaRepository` for a test double (or
 * a different persistence layer entirely) never touches service code.
 *
 * `unsetDefaultForUser` exists as its own method rather than something
 * `update` does implicitly: a future concrete implementation needs to
 * clear the *previous* default (if any) and set the *new* one, ideally
 * in one transaction — a distinct enough operation to deserve its own
 * contract method rather than being buried inside a generic update.
 */
export interface AddressRepository {
  findById(id: string): Promise<Address | null>;
  findByUserId(
    userId: string,
    query: ParsedQuery,
    filters?: AddressFilterOptions,
  ): Promise<PaginatedResult<Address>>;
  findDefaultByUserId(userId: string, type?: AddressType): Promise<Address | null>;
  create(data: CreateAddressInput): Promise<Address>;
  update(id: string, data: UpdateAddressInput): Promise<Address>;
  delete(id: string): Promise<void>;
  unsetDefaultForUser(userId: string, type?: AddressType): Promise<void>;
}
