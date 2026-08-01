import { ConflictError } from "../../../errors";

/**
 * Thrown by `InventoryPrismaRepository.applyStockChange`/`transferStock`
 * when a version-checked write matches zero rows — another mutation
 * against the same item(s) committed first (see `InventoryItem.version`'s
 * doc comment in `prisma/schema.prisma`). A distinct subclass of
 * `ConflictError` (still a 409 to an API caller — `errors/app-error.ts`
 * only inspects `statusCode`) rather than a plain one, so
 * `service/inventory.service.ts`'s `withOptimisticRetry` can catch
 * *specifically* a lost concurrency race and retry it, without also
 * swallowing-and-retrying an unrelated `ConflictError` the service
 * itself throws for a real business rule (e.g. "insufficient available
 * stock") — retrying that would just fail the same way again.
 */
export class InventoryConcurrencyError extends ConflictError {
  constructor(message = "Inventory item was modified concurrently", details?: unknown) {
    super(message, details);
  }
}
