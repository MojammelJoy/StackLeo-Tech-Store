import { Container } from "@stackleo/ui";

import { RegisterForm } from "../../components/auth/RegisterForm";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500">Join StackLeo to start shopping.</p>
        <RegisterForm />
      </div>
    </Container>
  );
}
