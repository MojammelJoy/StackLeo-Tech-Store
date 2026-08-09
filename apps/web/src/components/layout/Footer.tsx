import { Container } from "@stackleo/ui";
import Link from "next/link";

import { getPublicEnv } from "../../lib/env/env";

const FOOTER_SECTIONS = [
  {
    heading: "Shop",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/deals", label: "Deals" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/account", label: "My Account" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About StackLeo" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  const { siteName, siteTagline } = getPublicEnv();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            Stack<span className="text-primary-600">Leo</span>
          </span>
          <p className="mt-2 max-w-xs text-sm text-neutral-500">{siteTagline}</p>
        </div>

        {FOOTER_SECTIONS.map((section) => (
          <div key={section.heading}>
            <h3 className="text-sm font-semibold text-neutral-900">{section.heading}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-neutral-200">
        <Container className="py-6 text-sm text-neutral-500">
          © {currentYear} {siteName}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
