/**
 * What a future seller/admin reply to a review would look like. No
 * repository or service method in this foundation creates, reads, or
 * persists one of these — reply support is explicitly a *future*
 * capability this shape only documents ahead of time, the same way
 * `modules/order`'s `interfaces/payment-reference.interface.ts`
 * documents a future integration without implementing it.
 */
export interface ReviewReply {
  id: string;
  reviewId: string;
  authorId: string;
  body: string;
  createdAt: Date;
}
