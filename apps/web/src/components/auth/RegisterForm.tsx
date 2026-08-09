"use client";

import { Button, Input } from "@stackleo/ui";
import { registerSchema } from "@stackleo/validation";
import Link from "next/link";
import { useState } from "react";

import { useRegister } from "../../hooks/use-auth";
import { getAuthErrorMessage } from "../../lib/api/auth";

import type { FormEvent } from "react";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function RegisterForm() {
  const register = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = registerSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "email" || field === "password") {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    register.mutate(result.data);
  }

  if (register.isSuccess) {
    return (
      <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
        Account created. Registration doesn&apos;t sign you in automatically —{" "}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          sign in
        </Link>{" "}
        to continue.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className="mt-1"
        />
        {fieldErrors.email ? (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          className="mt-1"
        />
        {fieldErrors.password ? (
          <p id="password-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.password}
          </p>
        ) : (
          <p className="mt-1 text-sm text-neutral-500">8–72 characters.</p>
        )}
      </div>

      {register.isError ? (
        <p role="alert" className="text-sm text-red-600">
          {getAuthErrorMessage(register.error)}
        </p>
      ) : null}

      <Button type="submit" disabled={register.isPending} className="mt-2">
        {register.isPending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
