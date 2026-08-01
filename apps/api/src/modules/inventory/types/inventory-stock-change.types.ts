import type { InventoryStatus } from "../constants";

/**
 * The new values to write for a single version-checked stock mutation —
 * the persistence-layer input to `InventoryRepository.applyStockChange`.
 * Deliberately just "what to write", not "what changed": computing the
 * new `quantity`/`reservedQuantity`/`status` from the current item plus
 * a delta is `service/inventory.service.ts`'s job (it's a business
 * rule — negative-stock prevention, status re-derivation — not a
 * persistence concern), never the repository's.
 */
export interface StockChangeInput {
  quantity?: number;
  reservedQuantity?: number;
  status?: InventoryStatus;
}

/** One side of a `transferStock` call — already-computed new state for
 * one item, plus the `version` it was read at (for the optimistic
 * concurrency check on that specific item). */
export interface StockTransferSide {
  id: string;
  expectedVersion: number;
  newQuantity: number;
  newStatus: InventoryStatus;
}

/**
 * Input to `InventoryRepository.transferStock` — both sides' new state,
 * already computed by the service, plus the transferred amount (used
 * only for the two movement rows' `quantity`, not for any arithmetic
 * the repository performs itself).
 */
export interface TransferStockParams {
  source: StockTransferSide;
  destination: StockTransferSide;
  quantity: number;
  reason?: string | null;
}
