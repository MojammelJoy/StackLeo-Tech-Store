import type { Category, CategoryNode } from "../types";

/** Orders siblings by `sortOrder` ascending, breaking ties by `name` —
 * matches `prisma/schema.prisma`'s doc comment on `Category.sortOrder`. */
function compareSiblings(a: Category, b: Category): number {
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
}

/** Groups a flat `Category[]` by `parentId` (using the literal string
 * `"root"` as the key for top-level categories, since a `Map` can't use
 * `null` and a real category id both as keys without a type union that
 * adds nothing here) — the shared first step every function in this
 * module builds on. */
function groupByParent(categories: Category[]): Map<string, Category[]> {
  const groups = new Map<string, Category[]>();
  for (const category of categories) {
    const key = category.parentId ?? "root";
    const siblings = groups.get(key);
    if (siblings) {
      siblings.push(category);
    } else {
      groups.set(key, [category]);
    }
  }
  return groups;
}

/**
 * Recursively builds every node reachable from `parentId` within
 * `groups`, depth-first. A category whose own parent isn't present in
 * `groups` (e.g. filtered out upstream — see
 * `service/category.service.ts`'s visibility scoping) is unreachable
 * from any root and is correctly never visited, without needing an
 * explicit exclusion check here.
 */
function buildNodes(groups: Map<string, Category[]>, parentId: string): CategoryNode[] {
  const children = groups.get(parentId) ?? [];
  return [...children].sort(compareSiblings).map((category) => ({
    ...category,
    children: buildNodes(groups, category.id),
  }));
}

/**
 * Builds the full forest (every top-level category and its descendants,
 * recursively) from a flat, already-fetched `Category[]` — one query,
 * then an in-memory recursive walk, rather than one query per tree
 * level.
 */
export function buildCategoryForest(categories: Category[]): CategoryNode[] {
  const groups = groupByParent(categories);
  return buildNodes(groups, "root");
}

/**
 * Builds a single subtree rooted at `rootId` (including `rootId`
 * itself) from a flat, already-fetched `Category[]`. Returns `null`
 * when `rootId` isn't present in `categories` — the caller (see
 * `service/category.service.ts`'s `getSubtree`) turns that into a
 * `NotFoundError`.
 */
export function buildCategorySubtree(categories: Category[], rootId: string): CategoryNode | null {
  const root = categories.find((category) => category.id === rootId);
  if (!root) {
    return null;
  }

  const groups = groupByParent(categories);
  return { ...root, children: buildNodes(groups, root.id) };
}

/**
 * Collects the ids of every descendant of `rootId` (not including
 * `rootId` itself), depth-first, from a flat, already-fetched
 * `Category[]`. Used by `service/category.service.ts` to cascade soft
 * delete/restore down a subtree. `categories` should be fetched with
 * `includeDeleted: true` so the walk can pass through an
 * already-deleted intermediate node to still find its non-deleted
 * descendants — see `CategoryRepository.findManyForTree`.
 */
export function collectDescendantIds(categories: Category[], rootId: string): string[] {
  const groups = groupByParent(categories);
  const result: string[] = [];

  function walk(parentId: string): void {
    for (const child of groups.get(parentId) ?? []) {
      result.push(child.id);
      walk(child.id);
    }
  }

  walk(rootId);
  return result;
}
