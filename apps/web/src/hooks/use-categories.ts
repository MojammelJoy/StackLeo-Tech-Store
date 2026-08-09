import { useQuery } from "@tanstack/react-query";

import { getCategories } from "../lib/api/categories";

/** Centralized so any future category-related query (e.g. a single
 * category by slug) extends this instead of hand-writing its own key. */
export const categoryQueryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryQueryKeys.all, "list"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryQueryKeys.list(),
    queryFn: ({ signal }) => getCategories(signal),
  });
}
