import { Container } from "@stackleo/ui";

import { LoginForm } from "../../components/auth/LoginForm";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-neutral-900">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">Welcome back to StackLeo.</p>
        <LoginForm />
      </div>
    </Container>
  );
}
