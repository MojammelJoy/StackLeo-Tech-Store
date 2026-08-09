import { cn } from "../lib/cn";

import type { HTMLAttributes } from "react";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * Generic loading placeholder. Sections that will eventually render
 * API-backed content (product grids, category tiles) compose this instead
 * of shipping a hardcoded/fake data preview.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("animate-pulse rounded-lg bg-neutral-200", className)}
      {...props}
    />
  );
}
