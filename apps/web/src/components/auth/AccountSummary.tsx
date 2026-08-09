"use client";

import { Button, Container } from "@stackleo/ui";

import { useCurrentUser, useLogout } from "../../hooks/use-auth";

/** Deliberately minimal — proves the auth loop (session read + sign out)
 * works end to end. The real account dashboard is a later part. */
export function AccountSummary() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  if (!user) {
    return null;
  }

  return (
    <Container className="py-16">
      <h1 className="text-2xl font-bold text-neutral-900">Account</h1>
      <p className="mt-2 text-sm text-neutral-600">Signed in as {user.email}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-6"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        {logout.isPending ? "Signing out…" : "Sign out"}
      </Button>
    </Container>
  );
}
