/**
 * The persisted CartItem domain entity. `sku`/`unitPrice` are a
 * snapshot taken when the item was added — not a live lookup against
 * `modules/product` (which this foundation never imports, consistent
 * with every module in this monorepo staying decoupled from its
 * siblings) — so a price change elsewhere never silently rewrites an
 * already-added line item.
 */
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  sku: string;
  quantity: number;
  /** Minor currency unit (e.g. cents for USD), snapshotted at add-time. */
  unitPrice: number;
  /** Whether this item is included in `CartSummary`/checkout — see `utils/selected-items.util.ts`. */
  selected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository-level creation input. `unitPrice` is populated by the
 * service after a price lookup — never taken from client input — the
 * same reasoning `modules/media`'s `CreateMediaAssetInput` documents for
 * `url`/`providerRef`. See `dto/add-cart-item.dto.ts` for the much
 * narrower shape a client actually submits.
 */
export interface CreateCartItemInput {
  cartId: string;
  productId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  selected?: boolean;
}

export interface UpdateCartItemInput {
  quantity?: number;
  selected?: boolean;
}
