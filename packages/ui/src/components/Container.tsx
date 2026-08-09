import { cn } from "../lib/cn";

import type { HTMLAttributes } from "react";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "header" | "footer" | "main";
}

/**
 * Shared max-width, horizontally-centered content wrapper with responsive
 * gutters. Every page/section-level layout in an app should compose this
 * instead of redeclaring `mx-auto max-w-* px-*` at each call site.
 */
export function Container({ as: Component = "div", className, ...props }: ContainerProps) {
  return (
    <Component
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
