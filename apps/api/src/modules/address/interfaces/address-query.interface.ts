import type { AddressLabel, AddressType } from "../constants";

/**
 * Address-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` — the reason this lives
 * in its own `interfaces/` folder rather than inside either one. Every
 * field here corresponds 1:1 to `constants/address.constants.ts`'s
 * `ADDRESS_FILTERABLE_FIELDS`.
 */
export interface AddressFilterOptions {
  type?: AddressType;
  label?: AddressLabel;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
  country?: string;
  /** Include soft-deleted addresses — `false`/absent everywhere except
   * the lookup `AddressService.restore` uses to find an already-deleted
   * address by id. */
  includeDeleted?: boolean;
}
