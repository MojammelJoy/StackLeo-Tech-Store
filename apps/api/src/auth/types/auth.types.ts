/**
 * The authenticated principal attached to `req.user` by `authenticate`/
 * `extractCurrentUser`. `roles` is always an array — empty when the
 * token carries none — so `authorize` never has to guard against it
 * being undefined.
 */
export interface AuthenticatedUser {
  id: string;
  roles: string[];
}
