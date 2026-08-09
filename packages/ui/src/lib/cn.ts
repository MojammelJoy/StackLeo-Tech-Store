type ClassValue = string | false | null | undefined;

/**
 * Joins conditional class names, dropping falsy values. Deliberately not
 * `clsx`/`tailwind-merge` — this package has no styling-utility dependency
 * yet, and a one-line join is all `packages/ui`'s current primitives need.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
