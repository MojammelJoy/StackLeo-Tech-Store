"use client";

import { Skeleton, cn } from "@stackleo/ui";
import { useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from "../layout/icons";

import type { MediaAsset } from "@stackleo/types";

interface ProductGalleryProps {
  productName: string;
  assets: MediaAsset[] | undefined;
  isLoading: boolean;
  /** A failed media fetch never blocks the PDP — it degrades to the same
   * empty-gallery placeholder as a product with zero images. */
  isError: boolean;
}

function GallerySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-square w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-16 shrink-0" />
        ))}
      </div>
    </div>
  );
}

function EmptyGallery({ productName }: { productName: string }) {
  return (
    <div
      role="img"
      aria-label={`No image available for ${productName}`}
      className="flex aspect-square w-full items-center justify-center rounded-lg bg-neutral-100 text-neutral-300"
    >
      <ImageIcon className="h-16 w-16" />
    </div>
  );
}

/**
 * Left-column PDP gallery. Renders whatever `GET /media/owner/product/:id`
 * returns as-is — there is no "primary image" field on that response, so
 * the first asset in the array is simply shown first; nothing here
 * invents a ranking. Zero images and a failed media fetch are handled
 * identically (an empty-state placeholder), since neither should ever
 * block the rest of the page from rendering.
 */
export function ProductGallery({ productName, assets, isLoading, isError }: ProductGalleryProps) {
  const images = assets ?? [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (isError || images.length === 0) {
    return <EmptyGallery productName={productName} />;
  }

  const safeIndex = Math.min(activeIndex, images.length - 1);
  const activeImage = images[safeIndex];
  if (!activeImage) {
    // Unreachable: `images.length === 0` already returned above, so
    // `safeIndex` is always a valid index — this only satisfies
    // `noUncheckedIndexedAccess`.
    return <EmptyGallery productName={productName} />;
  }

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % images.length);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
        {/* Plain <img> deliberately: next/image needs remotePatterns
            pointing at the API's media host, out of scope for this change. */}
        <img
          src={activeImage.url}
          alt={activeImage.altText ?? productName}
          className="h-full w-full object-cover"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === safeIndex}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                index === safeIndex
                  ? "border-primary-600"
                  : "border-transparent hover:border-neutral-300",
              )}
            >
              <img
                src={image.url}
                alt={image.altText ?? `${productName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
