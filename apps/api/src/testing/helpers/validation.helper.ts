import type { z } from "zod";

/**
 * Asserts `schema.safeParse(input)` succeeds and returns the parsed
 * value — throws with `error.issues` inlined into the message when it
 * doesn't, so a failing assertion shows *why* a schema rejected input
 * instead of just "expected true, got false".
 */
export function expectZodSuccess<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `Expected schema to accept input, but it was rejected: ${result.error.message}`,
    );
  }
  return result.data;
}

/** Asserts `schema.safeParse(input)` fails — returns the Zod issues so
 * a test can assert on which field(s) were rejected and why. */
export function expectZodError<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): z.ZodIssue[] {
  const result = schema.safeParse(input);
  if (result.success) {
    throw new Error("Expected schema to reject input, but it was accepted");
  }
  return result.error.issues;
}
