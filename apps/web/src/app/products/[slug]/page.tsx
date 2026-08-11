import { notFound } from "next/navigation";

import { ProductDetailView } from "../../../components/product/ProductDetailView";
import { ApiError } from "../../../lib/api/client";
import { getProductBySlug } from "../../../lib/api/products";

import type { ProductDetail } from "@stackleo/types";
import type { Metadata } from "next";

interface ProductPageProps {
  params: { slug: string };
}

type ProductLoadResult =
  { kind: "found"; product: ProductDetail } | { kind: "not-found" } | { kind: "error" };

/**
 * Server-side product lookup shared by `generateMetadata` and the page
 * component below — Next.js automatically memoizes identical `fetch`
 * calls within one render pass, so calling this twice per request
 * costs one network round trip, not two. A 404 is distinguished from
 * every other failure (`"not-found"` vs `"error"`): only a genuine 404
 * should render Next's not-found page; a transient backend/network
 * error instead falls through to `ProductDetailView`'s own
 * client-side, retry-capable error state rather than failing SSR.
 */
async function loadProduct(slug: string): Promise<ProductLoadResult> {
  try {
    // "no-store": this is per-request storefront data (price/status/
    // stock can change between visitors) — never let Next's Data Cache
    // serve a stale SSR snapshot indefinitely (see `getProductBySlug`'s
    // doc comment).
    const product = await getProductBySlug(slug, undefined, "no-store");
    return { kind: "found", product };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { kind: "not-found" };
    }
    return { kind: "error" };
  }
}

/** Treats a blank/whitespace-only string the same as `null` — an SEO
 * field that was cleared to `""` should fall back exactly like one
 * that was never set. */
function firstNonBlank(...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    if (value && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

/** Uses `product.seoTitle`/`seoDescription` when set, falling back to
 * `product.name`/`description`; the slug route itself is the canonical
 * URL. A not-found or errored lookup still renders generic, honest
 * metadata rather than leaking a raw error. */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const result = await loadProduct(params.slug);
  if (result.kind !== "found") {
    return { title: result.kind === "not-found" ? "Product Not Found" : "Product" };
  }

  const { product } = result;
  return {
    title: firstNonBlank(product.seoTitle, product.name),
    description: firstNonBlank(product.seoDescription, product.description),
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const result = await loadProduct(params.slug);
  if (result.kind === "not-found") {
    notFound();
  }

  return <ProductDetailView slug={params.slug} />;
}
