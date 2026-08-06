/** One line item's final, already-decided state to persist during a
 * guest-cart merge — `CartService.mergeGuestCartIntoUserCart` resolves
 * quantities/prices (summing against whatever the target cart already
 * has, re-validating stock) before handing them to the repository;
 * the repository only ever executes the write atomically, never decides
 * a quantity itself. */
export interface MergeCartItemInput {
  productId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface MergeCartItemsParams {
  guestCartId: string;
  targetCartId: string;
  items: MergeCartItemInput[];
}
