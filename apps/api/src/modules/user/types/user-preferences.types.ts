/**
 * App-level UX/notification settings — matches the `UserPreferences`
 * model in `prisma/schema.prisma`. Distinct from `UserProfile`: this is
 * how the user wants the product to behave for them, not how they
 * present themselves to others.
 */
export interface UserPreferences {
  id: string;
  userId: string;
  locale: string;
  timezone: string;
  currency: string;
  theme: string;
  marketingEmailsOptIn: boolean;
  orderUpdatesOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Partial update applied via an upsert — an absent field leaves the
 * existing (or default, on first creation) value untouched. */
export interface UpsertUserPreferencesInput {
  locale?: string;
  timezone?: string;
  currency?: string;
  theme?: string;
  marketingEmailsOptIn?: boolean;
  orderUpdatesOptIn?: boolean;
}
