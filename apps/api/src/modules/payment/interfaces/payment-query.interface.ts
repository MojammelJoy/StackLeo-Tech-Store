import type { PaymentMethod, PaymentProviderName, PaymentStatus } from "../constants";

/** Payment-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (the skeleton). */
export interface PaymentFilterOptions {
  status?: PaymentStatus;
  method?: PaymentMethod;
  provider?: PaymentProviderName;
}
