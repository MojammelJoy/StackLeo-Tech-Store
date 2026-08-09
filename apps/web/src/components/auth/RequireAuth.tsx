"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUser } from "../../hooks/use-auth";

import type { ReactNode } from "react";

/**
 * Client-side route guard — deliberately not Next.js Middleware or a
 * Server Component check. `access_token`/`refresh_token` are httpOnly
 * cookies scoped to the API's own origin. In local dev both apps happen
 * to share the host "localhost" (only the port differs), so those
 * cookies incidentally reach apps/web's server too — but cookie
 * scoping ignores ports, and in any real deployment apps/web and apps/api
 * sit on different domains, where the browser would never attach those
 * cookies to a request aimed at apps/web at all. Next.js Middleware or a
 * Server Component reading `cookies()` would therefore work only by a
 * local-dev accident, decide auth using a token it can't even verify
 * (it doesn't hold `JWT_ACCESS_SECRET`), and break silently in
 * production. The only place in this architecture that can reliably
 * answer "is this person signed in" is a direct, credentialed browser
 * request to the API — exactly what `useCurrentUser` already does — so
 * the guard has to live here, client-side.
 *
 * Trade-off this accepts: protected content briefly does not render
 * (loading state) before an unauthenticated visitor is redirected,
 * rather than the redirect happening before any response reaches the
 * browser. That's the honest cost of not having a same-origin session
 * cookie or a BFF proxy in front of the API — not a bug to hide.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isPending } = useCurrentUser();

  useEffect(() => {
    if (!isPending && user === null) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  if (isPending || !user) {
    return (
      <div className="flex justify-center py-24">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
