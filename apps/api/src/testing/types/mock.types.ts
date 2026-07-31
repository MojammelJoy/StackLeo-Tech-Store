import type { Mock } from "vitest";

/**
 * Every function-typed property of `T` replaced with a Vitest `Mock` —
 * what `mocks/mock-builder.util.ts`'s `createMockOf` returns, and the
 * type a hand-built fake repository/provider (the same pattern every
 * prior foundation's own smoke tests used) can be annotated with
 * instead of `as unknown as T`.
 */
export type Mocked<T> = {
  [K in keyof T]: T[K] extends (...args: infer TArgs) => infer TReturn
    ? Mock<(...args: TArgs) => TReturn>
    : T[K];
};

/** A recursive `Partial<T>` — what a factory override parameter (see
 * `factories/factory.util.ts`) accepts for nested object fields, so a
 * caller can override one nested property without repeating every
 * sibling. */
export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;
