"use client";

import { Container, Input } from "@stackleo/ui";
import Link from "next/link";
import { useState } from "react";

import { useCurrentUser } from "../../hooks/use-auth";
import { useCart } from "../../hooks/use-cart";

import { CartIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/deals", label: "Deals" },
];

const ICON_LINK_CLASSES =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100";

/**
 * Site header: branding, primary nav, search entry point, and cart/account
 * entry points. Client component because the mobile nav toggle needs
 * local state — the search form itself is a plain GET-navigating HTML
 * form and works without JavaScript.
 */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const { data: cart } = useCart();
  const cartItemCount = cart?.summary.itemCount ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center gap-4">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className={`${ICON_LINK_CLASSES} -ml-2 lg:hidden`}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>

        <Logo />

        <nav aria-label="Primary" className="hidden lg:flex lg:items-center lg:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action="/search" method="GET" role="search" className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="search"
              name="q"
              placeholder="Search products..."
              aria-label="Search products"
              className="pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/search" aria-label="Search" className={`${ICON_LINK_CLASSES} md:hidden`}>
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            aria-label={user ? "Account" : "Sign in"}
            className={ICON_LINK_CLASSES}
          >
            <UserIcon className="h-5 w-5" />
          </Link>
          <Link href="/cart" aria-label="Cart" className={`${ICON_LINK_CLASSES} relative`}>
            <CartIcon className="h-5 w-5" />
            {cartItemCount > 0 ? (
              <span className="bg-primary-600 absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none text-white">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </Container>

      {isMobileMenuOpen ? (
        <nav aria-label="Primary" className="border-t border-neutral-200 lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
