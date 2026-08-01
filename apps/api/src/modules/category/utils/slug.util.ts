import { CATEGORY_SLUG_MAX_LENGTH } from "../constants";

const FALLBACK_SLUG = "category";

/** Matches Unicode combining diacritical marks (U+0300-U+036F) left
 * behind by `"…".normalize("NFKD")` — built from `String.fromCharCode`
 * rather than a literal regex range, since that range is made entirely
 * of combining characters that are unsafe to embed literally in a
 * source file. Mirrors `modules/product`'s `slug.util.ts` exactly. */
const COMBINING_DIACRITICS_PATTERN = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g",
);

/**
 * Derives a URL-safe slug from a category name: strips diacritics,
 * lower-cases, collapses everything that isn't `[a-z0-9]` into single
 * hyphens, and trims leading/trailing hyphens. Falls back to
 * `FALLBACK_SLUG` for a name that slugifies to nothing (e.g. one made
 * entirely of punctuation/emoji) rather than producing an empty slug.
 */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, CATEGORY_SLUG_MAX_LENGTH);

  return slug.length > 0 ? slug : FALLBACK_SLUG;
}

/**
 * Slugifies `name`, then appends `-2`, `-3`, ... until `slugExists`
 * reports the candidate is free. `slugExists` is injected rather than
 * this function taking a repository directly, so slug generation stays
 * a pure, easily-testable string operation — `service/category.service.ts`
 * is the only caller, and it's the one with database access.
 */
export async function generateUniqueSlug(
  name: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(name);

  if (!(await slugExists(base))) {
    return base;
  }

  let attempt = 2;
  for (;;) {
    const suffix = `-${attempt}`;
    const candidate = `${base.slice(0, CATEGORY_SLUG_MAX_LENGTH - suffix.length)}${suffix}`;
    if (!(await slugExists(candidate))) {
      return candidate;
    }
    attempt += 1;
  }
}
