import { AccountSummary } from "../../components/auth/AccountSummary";
import { RequireAuth } from "../../components/auth/RequireAuth";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountSummary />
    </RequireAuth>
  );
}
