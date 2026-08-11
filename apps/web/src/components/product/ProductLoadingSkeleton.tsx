import { Skeleton } from "@stackleo/ui";

/** Structural placeholder matching the real PDP's two-column (desktop)
 * / stacked (mobile) layout, shown while `useProductBySlug` is pending. */
export function ProductLoadingSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Skeleton className="aspect-square w-full" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-16 shrink-0" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-11 w-40" />
      </div>
    </div>
  );
}
